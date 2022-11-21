//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;
use web_sys::console;
use shared_utils::mimc_hash;
use shared_utils::prove;
use shared_utils::verify;
use shared_utils::prove_set_membership;
use shared_utils::verify_set_membership;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn correct_flow_for_one_member() {    
    let secret = 1;
    let salt = 1;
    
    // Should succeeds if proof of preimage is correct
    let image = mimc_hash(secret, salt);
    console::log_1(&format!("Image: {:?}", &image).into());
    let proof = prove(secret, salt);
    console::log_1(&format!("Proof: {:?}", &proof).into());
    let result = verify(image, proof);
    assert_eq!(result, true);

    // Must fail if proof doesn't match image
    let other_proof = prove(0, 1);
    let other_image = mimc_hash(0, 0);
    let result = verify(other_image, other_proof);
    assert_eq!(result, false);
}

#[wasm_bindgen_test]
fn correct_flow_for_set_membership() {
    // Should not fail
    let set = [mimc_hash(0, 0), mimc_hash(0,1)];
    console::log_1(&format!("Set: {:?}", set).into());
    let proof = prove_set_membership(set.to_vec(), 0, 0);
    console::log_1(&format!("Proof: {:?}", &proof).into());
    let result = verify_set_membership(set.to_vec(), proof);
    assert_eq!(result, true);

    // Must fail
    let other_proof = prove_set_membership(set.to_vec(), 1, 1);
    let other_image = mimc_hash(1, 1);
    let result = verify_set_membership(set.to_vec(), other_proof);
    assert_eq!(result, false);
}
