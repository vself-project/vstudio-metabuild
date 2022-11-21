extern crate rand;
extern crate bulletproofs;
extern crate curve25519_dalek;
extern crate merlin;

use bulletproofs::r1cs::LinearCombination;
use bulletproofs::r1cs::{ConstraintSystem, Prover, R1CSError, R1CSProof, Variable, Verifier};
use bulletproofs::{BulletproofGens, PedersenGens};
use curve25519_dalek::scalar::Scalar;
use merlin::Transcript;
use wasm_bindgen::JsValue;

use crate::r1cs_utils::{constrain_lc_with_scalar, AllocatedScalar};

pub fn set_membership_1_gadget<CS: ConstraintSystem>(
    cs: &mut CS,
    v: AllocatedScalar,
    diff_vars: Vec<AllocatedScalar>,
    set: &[Scalar],
) -> Result<(), R1CSError> {
    let set_length = set.len();
    // Accumulates product of elements in `diff_vars`
    let mut product: LinearCombination = Variable::One().into();

    for i in 0..set_length {
        // Since `diff_vars[i]` is `set[i] - v`, `diff_vars[i]` + `v` should be `set[i]`
        constrain_lc_with_scalar::<CS>(
            cs,
            diff_vars[i].variable + v.variable,
            &Scalar::from(set[i]),
        );

        let (_, _, o) = cs.multiply(product.clone(), diff_vars[i].variable.into());
        product = o.into();
    }

    // Ensure product of elements if `diff_vars` is 0
    cs.constrain(product);

    Ok(())
}