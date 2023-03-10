# vSelf communities contract

This smart contract stores the community registry and allows users to manage membership.
You can check it [here](https://explorer.testnet.near.org/accounts/communities_v4.sergantche.testnet).

## Data structure

The contract stores data about communities using several collections:
`communities` - keep map from `community_id` to `CommunityData` sctructure that stores some immutable data about the community;
`members_by_community` - a map from `community_id` to an array of commitments;
`public_members_by_community` - a map from `community_id` to a map `commitment -> near_account`;

The difference between private and public members that it's unknown which NEAR user is a member of community, we know only information about their commitments. The map `public_members_by_community` stores NEAR account corresponding to the commitment.
