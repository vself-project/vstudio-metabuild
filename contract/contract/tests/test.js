const sh = require("shelljs");
const fs = require('fs');

const contractName = fs.readFileSync('./contract/neardev/dev-account').toString();
const masterAccount = fs.readFileSync('./contract/neardev/dev-account').toString();
console.log(contractName);
console.log(masterAccount);

// Communities
const community_id_1 = "1668962884171865314:250";
const community_id_2 = "1668962130306288499:43";
const commitment_1 = "commitment_1.test";
const commitment_2 = "commitment_2.test";
const near_account = "test.account.testnet";

// View methods
sh.exec(`near view ${contractName} get_community_list '{"from_index": 0, "limit": 100}' --accountId ${masterAccount}`);
sh.exec(`near view ${contractName} get_community_members '{"community_id": "${community_id_1}"}' --accountId ${masterAccount}`);
sh.exec(`near view ${contractName} get_community_public_members '{"community_id": "${community_id_1}"}' --accountId ${masterAccount}`);
sh.exec(`near view ${contractName} get_community '{"community_id": "${community_id_1}"}' --accountId ${masterAccount}`);

// Add new members
sh.exec(`near call ${contractName} add_member '{"community_id": "${community_id_1}", "commitment": "${commitment_1}"}' --accountId ${contractName}`);
sh.exec(`near call ${contractName} add_member '{"community_id": "${community_id_1}", "commitment": "${commitment_2}"}' --accountId ${contractName}`);

// Add new public member
sh.exec(`near call ${contractName} add_public_member '{"community_id": "${community_id_1}", "commitment": "${commitment_2}", "near_id": "${near_account}"}' --accountId ${contractName}`);

// Check community data after changes
sh.exec(`near view ${contractName} get_community_list '{"from_index": 0, "limit": 100}' --accountId ${masterAccount}`);
sh.exec(`near view ${contractName} get_community_members '{"community_id": "${community_id_1}"}' --accountId ${masterAccount}`);
sh.exec(`near view ${contractName} get_community_public_members '{"community_id": "${community_id_1}"}' --accountId ${masterAccount}`);
sh.exec(`near view ${contractName} get_community '{"community_id": "${community_id_1}"}' --accountId ${masterAccount}`);

// Remove community
//sh.exec(`near call ${contractName} remove_community '{"community_id": "${community_id_1}"}' --accountId ${contractName}`);
//sh.exec(`near view ${contractName} get_community_list '{"from_index": 0, "limit": 100}' --accountId ${masterAccount}`);

// exit script with the same code as the build command
process.exit();
