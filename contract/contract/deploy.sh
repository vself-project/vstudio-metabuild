#!/bin/sh

./build.sh

if [ $? -ne 0 ]; then
  echo ">> Error building contract"
  exit 1
fi

echo ">> Deploying contract"

readonly CONTRACT_NAME=communities_v4.sergantche.testnet
readonly MASTER_ACCOUNT=sergantche.testnet

# https://docs.near.org/tools/near-cli#near-dev-deploy
near create-account ${CONTRACT_NAME} --masterAccount=${MASTER_ACCOUNT} --initial-balance 30
near deploy --wasmFile ./target/wasm32-unknown-unknown/release/vself_communities.wasm --accountId ${CONTRACT_NAME}
