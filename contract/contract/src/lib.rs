/*
 * This contract allows to create and manage communities  
 *
 * Learn more about writing NEAR smart contracts with Rust:
 * https://near-docs.io/develop/Contract
 *
 */

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, LookupMap};
use near_sdk::{env, near_bindgen, BorshStorageKey, PanicOnDefault, AccountId};
use near_sdk::serde::{Deserialize, Serialize};
use std::collections::HashMap;

const ERR_CALLER_IS_NOT_OWNER: &str = "Method call access denied";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Members,
    PublicMembers,
    Communities
}

#[derive(Clone, Debug, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct CommunityData {
    community_owner: AccountId,
    community_name: String,
    community_description: String,
    community_source_image: String,
    badge_event_id: String,
    badge_name: String,
    badge_description: String,
    badge_source_image: String,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    members_by_community: LookupMap<String, Vec<String>>,
    public_members_by_community: LookupMap<String, HashMap<String, AccountId>>,
    communities: UnorderedMap<String, CommunityData>
}

#[near_bindgen]
impl Contract {
    /// Constructor
    #[init]
    pub fn new() -> Self {
        // Init
        Self {
            members_by_community: LookupMap::new(StorageKey::Members),
            public_members_by_community: LookupMap::new(StorageKey::PublicMembers),
            communities: UnorderedMap::new(StorageKey::Communities)
        }
    }

    /// Add new community
    #[payable]
    pub fn add_community(&mut self, community_data: CommunityData) -> String {
        // Generate community id
        let rand: u8 = *env::random_seed().get(0).unwrap();
        let timestamp: u64 = env::block_timestamp();
        let community_id: String = format!("{}:{}", timestamp, rand);

        // Add new community
        self.communities.insert(&community_id, &community_data);
        self.members_by_community.insert(&community_id, &vec![]);
        self.public_members_by_community.insert(&community_id, &HashMap::new());
        community_id
    }

    /// Remove community data from all collections
    #[payable]
    pub fn remove_community(&mut self, community_id: String) -> bool {
        let community_data = self.communities.get(&community_id).unwrap();
        assert_eq!(env::predecessor_account_id(), community_data.community_owner, "{}", ERR_CALLER_IS_NOT_OWNER);
        self.communities.remove(&community_id);
        self.members_by_community.remove(&community_id);
        self.public_members_by_community.remove(&community_id);
        true
    }

    /// Add new member (commitment) to the community `community_id`
    pub fn add_member(&mut self, community_id: String, commitment: String) -> bool {
        let mut commitments = self.members_by_community.get(&community_id).unwrap();
        commitments.push(commitment);
        self.members_by_community.insert(&community_id, &commitments);
        true
    }

    /// Add new public member to the community `community_id`
    pub fn add_public_member(&mut self, community_id: String, commitment: String, near_id: AccountId) -> bool {
        let mut public_members = self.public_members_by_community.get(&community_id).unwrap();
        public_members.insert(commitment, near_id);
        self.public_members_by_community.insert(&community_id, &public_members);
        true
    }

    /// Returns community ids with data 
    pub fn get_community_list(&self, from_index: usize, limit: usize) -> Vec<(String, CommunityData)> {
        self.communities
            .iter()
            .skip(from_index)
            .take(limit)
            .collect()
    }

    /// Returns list of members for the community `community_id`
    pub fn get_community_members(&self, community_id: String) -> Vec<String> {
        let members = self.members_by_community.get(&community_id).unwrap();
        members
    }

    /// Returns list of public members for the community `community_id`
    pub fn get_community_public_members(&self, community_id: String) -> HashMap<String, AccountId> {
        let public_members = self.public_members_by_community.get(&community_id).unwrap();
        public_members
    }

    /// Returns community data, members and public members
    pub fn get_community(&self, community_id: String) -> (CommunityData, Vec<String>, HashMap<String, AccountId>) {
        let members = self.members_by_community.get(&community_id).unwrap();
        let public_members = self.public_members_by_community.get(&community_id).unwrap();
        let community_data = self.communities.get(&community_id).unwrap();
        (community_data, members, public_members)
    }
}
