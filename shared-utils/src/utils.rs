extern crate ed25519_dalek;
extern crate rand;

use ed25519_dalek::Digest;
use ed25519_dalek::Keypair;
use ed25519_dalek::Sha512;
use ed25519_dalek::Signature;
use rand::rngs::OsRng;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // pub fn test_designated_verifier() {
    //     let mut csprng = OsRng{};
    //     let keypair: Keypair = Keypair::generate(&mut csprng);
    //     let message: &[u8] = b"All I want is to pet all of the dogs.";

    //     // Create a hash digest object which we'll feed the message into:
    //     let mut prehashed: Sha512 = Sha512::new();

    //     // 

    //     prehashed.input(message);
    //     println!("{:?}", keypair);
    // }
}