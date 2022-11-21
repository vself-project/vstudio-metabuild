mod utils;
use wasm_bindgen::prelude::*;

extern crate bulletproofs;
extern crate curve25519_dalek;
extern crate merlin;
extern crate rand;
use rand::thread_rng;

pub mod gadget_mimc;
pub mod gadget_set_membership;
pub mod r1cs_utils;

use crate::gadget_mimc::mimc;
use crate::gadget_mimc::mimc_gadget;
use crate::gadget_mimc::mimc_hash_2;
pub use gadget_mimc::MIMC_ROUNDS;

use crate::gadget_set_membership::set_membership_1_gadget;

// https://github.com/dalek-cryptography/bulletproofs
use serde::{Serialize, Deserialize};
use bulletproofs::r1cs::LinearCombination;
use bulletproofs::r1cs::{ConstraintSystem, Prover, R1CSError, R1CSProof, Variable, Verifier};
use bulletproofs::{BulletproofGens, PedersenGens};
use curve25519_dalek::ristretto::CompressedRistretto;
use curve25519_dalek::scalar::Scalar;
use merlin::Transcript;
use rand::{CryptoRng, RngCore};
use std::convert::TryInto;

use crate::r1cs_utils::constrain_lc_with_variable;
use crate::r1cs_utils::{constrain_lc_with_scalar, AllocatedScalar};


// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, shared-utils!");
}

/// Our part
const TRANSCRIPT_LABEL: &[u8; 10] = b"Transcript";

// Type definitions
#[derive(Serialize, Deserialize)]
pub struct Proof {
    pub proof_bytes: Vec<u8>, 
    pub commits_bytes: Vec<[u8; 32]>,
}

#[derive(Serialize, Deserialize)]
pub struct Commitment {
    pub image_bytes: [u8; 32],
}

// Generate commitment
#[wasm_bindgen]
pub fn mimc_hash(secret: u64, salt: u64) -> JsValue {
    let constants = (0..MIMC_ROUNDS).map(|i| Scalar::one()).collect::<Vec<_>>();
    
    let secret = Scalar::from(secret);
    let salt = Scalar::from(salt);

    let image = mimc(&secret, &salt, &constants);
    
    let image_bytes = image.to_bytes()
    .try_into()
    .expect("slice with incorrect length");
    //let public_commitment: u64 = u64::from_le_bytes(image_bytes);
    //public_commitment.to_bytes()
    
    let commitment = Commitment{ image_bytes };
    serde_wasm_bindgen::to_value(&commitment).unwrap()
}

// Generate proof of knowledge of mimc preimage
#[wasm_bindgen]
pub fn prove(secret: u64, salt: u64) -> JsValue {
    // setup common parameters
    let constants = (0..MIMC_ROUNDS).map(|i| Scalar::one()).collect::<Vec<_>>();    
    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(2048, 1);

    let mut rng = rand::thread_rng(); 
    let secret = Scalar::from(secret);
    let salt = Scalar::from(salt);

    let mut comms: Vec<CompressedRistretto> = vec![];
    let mut prover_transcript = Transcript::new(TRANSCRIPT_LABEL);
    let mut prover = Prover::new(&pc_gens, &mut prover_transcript);

    // commit private variables    
    let (com_secret, var_secret) = prover.commit(
        secret.clone(),
        Scalar::random(&mut rng),
    );
    comms.push(com_secret);
    let (com_salt, var_salt) = prover.commit(
        salt.clone(),
        Scalar::random(&mut rng),
    );
    comms.push(com_salt);

    let alloc_scal_secret = AllocatedScalar {
        variable: var_secret,
        assignment: Some(secret),
    };

    let alloc_scal_salt = AllocatedScalar {
        variable: var_salt,
        assignment: Some(salt),
    };

    let image = mimc(&secret, &salt, &constants);    
    assert!(mimc_gadget(
        &mut prover,
        alloc_scal_secret,
        alloc_scal_salt,
        MIMC_ROUNDS,
        &constants,
        &image
    )
    .is_ok());

    // construct resulting proof
    let proof = prover.prove(&bp_gens).unwrap();
    let mut commits_bytes = vec![];
    for item in comms {
        commits_bytes.push(item.to_bytes());
    };
    let proof = Proof { 
        proof_bytes: proof.to_bytes(), 
        commits_bytes: commits_bytes, 
    }; // Return proof

    serde_wasm_bindgen::to_value(&proof).unwrap()
}

// Verify proof of knowledge of mimc preimage
#[wasm_bindgen]
pub fn verify(image: JsValue, proof: JsValue) -> bool {
    let image: Commitment = serde_wasm_bindgen::from_value(image).unwrap();
    let proof: Proof = serde_wasm_bindgen::from_value(proof).unwrap();

    // setup common parameters
    let constants = (0..MIMC_ROUNDS).map(|i| Scalar::one()).collect::<Vec<_>>();
    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(2048, 1);

    let mut verifier_transcript = Transcript::new(TRANSCRIPT_LABEL);
    let mut verifier = Verifier::new(&mut verifier_transcript);
    
    let secret = CompressedRistretto::from_slice(&proof.commits_bytes[0]);
    let var_secret = verifier.commit(secret);
    let alloc_scal_secret = AllocatedScalar {
        variable: var_secret,
        assignment: None,
    };

    let salt = CompressedRistretto::from_slice(&proof.commits_bytes[1]);
    let var_salt = verifier.commit(salt);
    let alloc_scal_salt = AllocatedScalar {
        variable: var_salt,
        assignment: None,
    };

    let image = Scalar::from_canonical_bytes(image.image_bytes).unwrap_or(Scalar::zero());
    assert!(mimc_gadget(
        &mut verifier,
        alloc_scal_secret,
        alloc_scal_salt,
        MIMC_ROUNDS,
        &constants,
        &image
    )
    .is_ok());

    let proof = R1CSProof::from_bytes(&proof.proof_bytes).unwrap();
    verifier.verify(&proof, &pc_gens, &bp_gens).is_ok()
}

// Generate proof of knowledge 
#[wasm_bindgen]
pub fn prove_set_membership(set: Vec<JsValue>, secret: u64, salt: u64) -> JsValue {
    // setup common parameters
    let constants = (0..MIMC_ROUNDS).map(|i| Scalar::one()).collect::<Vec<_>>();    
    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(2048, 1);

    let mut rng = rand::thread_rng(); 
    let secret = Scalar::from(secret);
    let salt = Scalar::from(salt);

    let mut comms: Vec<CompressedRistretto> = vec![];
    let mut prover_transcript = Transcript::new(TRANSCRIPT_LABEL);
    let mut prover = Prover::new(&pc_gens, &mut prover_transcript);

    // commit private variables    
    let (com_secret, var_secret) = prover.commit(
        secret.clone(),
        Scalar::random(&mut rng),
    );
    comms.push(com_secret);
    let (com_salt, var_salt) = prover.commit(
        salt.clone(),
        Scalar::random(&mut rng),
    );
    comms.push(com_salt);

    let alloc_scal_secret = AllocatedScalar {
        variable: var_secret,
        assignment: Some(secret),
    };

    let alloc_scal_salt = AllocatedScalar {
        variable: var_salt,
        assignment: Some(salt),
    };
        
    // commit image value     
    let image = mimc(&secret, &salt, &constants);
    let value = Scalar::from(image);        
    let (com_value, var_value) = prover.commit(value.clone(), Scalar::random(&mut rng));
    let alloc_scal = AllocatedScalar {
        variable: var_value,
        assignment: Some(value),
    };
    comms.push(com_value);
    
    // check if we have mimc preimage relationship
    let res_v = mimc_hash_2(
        &mut prover,
        alloc_scal_secret.variable.into(),
        alloc_scal_salt.variable.into(),
        MIMC_ROUNDS,
        &constants,
    ).unwrap();
    constrain_lc_with_variable(&mut prover, res_v, &var_value);

    // commit differences and check product is zero
    let mut set_vars = vec![];
    let mut diff_vars: Vec<AllocatedScalar> = vec![];    
    let set_length = set.len();
    for i in 0..set_length {
        let image: Commitment = serde_wasm_bindgen::from_value(set[i].clone()).unwrap();
        let elem = Scalar::from_canonical_bytes(image.image_bytes).unwrap();        
        //let elem = Scalar::from(set[i]);
        let diff = elem - value;
        set_vars.push(elem);

        // Take difference of set element and value, `set[i] - value`
        let (com_diff, var_diff) = prover.commit(diff.clone(), Scalar::random(&mut rng));
        let alloc_scal_diff = AllocatedScalar {
            variable: var_diff,
            assignment: Some(diff),
        };
        diff_vars.push(alloc_scal_diff);
        comms.push(com_diff);
    }
    assert!(set_membership_1_gadget(&mut prover, alloc_scal, diff_vars, &set_vars).is_ok());

    // construct resulting proof
    let proof = prover.prove(&bp_gens).unwrap();
    let mut commits_bytes = vec![];
    for item in comms {
        commits_bytes.push(item.to_bytes());
    };
    let proof = Proof { 
        proof_bytes: proof.to_bytes(), 
        commits_bytes: commits_bytes, 
    }; // Return proof

    serde_wasm_bindgen::to_value(&proof).unwrap()
}

// Verify proof of knowledge 
#[wasm_bindgen]
pub fn verify_set_membership(set: Vec<JsValue>, proof: JsValue) -> bool { 
    let proof: Proof = serde_wasm_bindgen::from_value(proof).unwrap();

    // setup common parameters
    let constants = (0..MIMC_ROUNDS).map(|i| Scalar::one()).collect::<Vec<_>>();
    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(2048, 1);

    let mut verifier_transcript = Transcript::new(TRANSCRIPT_LABEL);
    let mut verifier = Verifier::new(&mut verifier_transcript);
    
    let secret = CompressedRistretto::from_slice(&proof.commits_bytes[0]);
    let var_secret = verifier.commit(secret);
    let alloc_scal_secret = AllocatedScalar {
        variable: var_secret,
        assignment: None,
    };

    let salt = CompressedRistretto::from_slice(&proof.commits_bytes[1]);
    let var_salt = verifier.commit(salt);
    let alloc_scal_salt = AllocatedScalar {
        variable: var_salt,
        assignment: None,
    };

    let image = CompressedRistretto::from_slice(&proof.commits_bytes[2]);
    let var_image = verifier.commit(image);
    let alloc_scal_image = AllocatedScalar {
        variable: var_image,
        assignment: None,
    };

    let res_v = mimc_hash_2(
        &mut verifier,
        alloc_scal_secret.variable.into(),
        alloc_scal_salt.variable.into(),
        MIMC_ROUNDS,
        &constants,
    ).unwrap();
    constrain_lc_with_variable(&mut verifier, res_v, &var_image);

    // commit differences and check product is zero
    let mut set_vars = vec![];
    let mut diff_vars: Vec<AllocatedScalar> = vec![];    
    let set_length = set.len();

    for i in 3..set_length+3 {
        let com_diff = CompressedRistretto::from_slice(&proof.commits_bytes[i]);
        let var_diff = verifier.commit(com_diff);
        let alloc_scal_diff = AllocatedScalar {
            variable: var_diff,
            assignment: None,
        };
        diff_vars.push(alloc_scal_diff);
    }
    
    for i in 0..set_length {
        let image: Commitment = serde_wasm_bindgen::from_value(set[i].clone()).unwrap();
        let elem = Scalar::from_canonical_bytes(image.image_bytes).unwrap();                
        set_vars.push(elem);        
    }
    assert!(set_membership_1_gadget(&mut verifier, alloc_scal_image, diff_vars, &set_vars).is_ok());

    let proof = R1CSProof::from_bytes(&proof.proof_bytes).unwrap();
    verifier.verify(&proof, &pc_gens, &bp_gens).is_ok()
}