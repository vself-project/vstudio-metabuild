const sh = require("shelljs");
const fs = require("fs");

const contractName = "communities_v4.sergantche.testnet";
const masterAccount = "sergantche.testnet";

// Call constructor one time
//sh.exec(`near call ${contractName} new --accountId ${contractName}`);

// Default communities for tests
const addDefaultCommunity = `near call ${contractName} add_community '{"community_data": {
  "community_owner": "sergantche.testnet",
  "community_name": "vSelf community",
  "community_description": "Web3 identity wallet",
  "community_source_image": "https://firebasestorage.googleapis.com/v0/b/vself-prod.appspot.com/o/vSelf%20community.png?alt=media&token=27d6fcb7-6ffe-4718-84b6-0a7640c57bfd",
  "badge_event_id": "3460112913",
  "badge_name": "vSelf community",
  "badge_description": "Kudos to community participants of the vSelf project",
  "badge_source_image": "https://firebasestorage.googleapis.com/v0/b/vself-prod.appspot.com/o/vSelf%20community.png?alt=media&token=27d6fcb7-6ffe-4718-84b6-0a7640c57bfd"}}' --accountId ${masterAccount}`;

const addChickenCommunity = `near call ${contractName} add_community '{"community_data": {
  "community_owner": "sergantche.testnet",
  "community_name": "Bears",
  "community_description": "Community for bears and honey lovers",
  "community_source_image": "https://ipfs.io/ipfs/bafybeig7ot4aluihyuvsleo5khxz6zr44foeydhauok6gf5cqjua5nidw4/bear.png",
  "badge_event_id": "841156741564",
  "badge_name": "Bear",
  "badge_description": "True Bear Badge",
  "badge_source_image": "https://ipfs.io/ipfs/bafybeig7ot4aluihyuvsleo5khxz6zr44foeydhauok6gf5cqjua5nidw4/bear.png"}}' --accountId ${masterAccount}`;

const addVselfDAO = `near call ${contractName} add_community '{"community_data": {
  "community_owner": "sergantche.testnet",
  "community_name": "vSelf DAO",
  "community_description": "Web3 identity wallet",
  "community_source_image": "https://firebasestorage.googleapis.com/v0/b/vself-prod.appspot.com/o/vSelf%20community.png?alt=media&token=27d6fcb7-6ffe-4718-84b6-0a7640c57bfd",
  "badge_event_id": "2899596021",
  "badge_name": "vSelf DAO badge",
  "badge_description": "Welcome badge for the vSelf DAO members",
  "badge_source_image": "https://firebasestorage.googleapis.com/v0/b/vself-prod.appspot.com/o/vSelf%20community.png?alt=media&token=27d6fcb7-6ffe-4718-84b6-0a7640c57bfd"}}' --accountId ${masterAccount}`;

// Create some communities
// if (sh.exec(addDefaultCommunity).code === 0) {
//   console.log("Add first  default community");
// }

// Bears
// if (sh.exec(addChickenCommunity).code === 0) {
//   console.log("Add bear community");
// }

// vSelf DAO
if (sh.exec(addVselfDAO).code === 0) {
  console.log("Add vSelf DAO community");
}

// exit script with the same code as the build command
process.exit();
