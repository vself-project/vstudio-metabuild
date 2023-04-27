<p align="center">
  <img src="images/logo.png" alt="Vself NinjaBlack"/>
</p>

# vStudio: zero-knowledge onboarding 

## Overview 
This repo contains source code of the zero-knowledge proofs vSelf SDK. This functionality might be helpful to integrate privacy preserving onboarding for closed communities and organizations. The package allows to generate zero-knowledge commitment, generate proof-of-membership without disclosing any personal data, and verify this proof. 

Source code is available in [/shared-utils](https://github.com/vself-project/vstudio-metabuild/tree/main/shared-utils)

## Privacy preserving onboarding

- Owner creates a private community.
- User generates commitment from public key and random salt.
- Commitment uses to join the given community.

![image](images/add.png)

- Community member generates proof-of-membership & send this proof for a verifier.
- Verifier checks proof-of-membership & processes the result of verification.

![image](images/verify.png)

## Deployment 

Package is availible at [npm registry](https://www.npmjs.com/package/@vself_project/shared-utils).
```js
npm install @vself_project/shared-utils
```

```js
mimc_hash(bigint left, bigint right) => Commitment
prove_set_membership(Vec<Commitment> set, bigint secret, bigint salt) => MembershipProof
verify_set_membership(Vec<Commitment> set, MembershipProof p) => bool
```

## Demo

The full demo of the private community & proof-of-membership is available in [web app.](https://vself.app/vstudio)

Smart contract is used for on-chain storage of the community data & manage membership deloyed at [communities_v1.sergantche_dev.near](https://explorer.near.org/accounts/communities_v1.sergantche_dev.near)

The contact source code is available in [vseld-dao](https://github.com/vself-project/vself-dao) & frontend source code in [vself-beta](https://github.com/vself-project/vself-beta)

Community management documentation is available [here.](https://vself-project.gitbook.io/vself-project-documentation/community-management-toolkit)

## Tech stack

We've developed our Rust implementation of non-interactive ZK proof-of-set-membership and [MiMC](https://byt3bit.github.io/primesym/mimc/) hash preimage, compiled it into WebAssembly and published the resulting package to NPM. Biggest thanks to original bulletproof impelemntation of [dalek](https://github.com/zkcrypto/bulletproofs) and for great source of R1CS gadget examples by [lovesh](https://github.com/lovesh/bulletproofs-r1cs-gadgets)

The package source code availible inside [/shared-utils](https://github.com/vself-project/vstudio-metabuild/tree/main/shared-utils) folder, and contains cryptographic building blocks we used for our solution along with automated tests.



## Future plans

There are two major improvements we have in mind at the momement for cryptography R&D:

- Implementing [Verkle trie](https://github.com/ethereum/research/blob/master/verkle_trie/verkle_trie.py) as replacement for commitments accumulator. It allows to scale size of community as proofs would have constant size independent of set size. Bulletproofs use [Pedersen commitments](https://www.getmonero.org/resources/moneropedia/pedersen-commitment.html?ref=panther-protocol-blog) as a part of a protocol which makes implementation pretty staightforward.

- Implementing proof-of-ownership of a public key, which allows to improve the private onboarding usecase & develop new interesting use cases such as designated verifier proofs or consentual airdrops on NEAR as it uses particular curve (Ed25519).
