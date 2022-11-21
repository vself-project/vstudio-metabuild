/* tslint:disable */
/* eslint-disable */
/**
*/
export function greet(): void;
/**
* @param {bigint} secret
* @param {bigint} salt
* @returns {any}
*/
export function mimc_hash(secret: bigint, salt: bigint): any;
/**
* @param {bigint} secret
* @param {bigint} salt
* @returns {any}
*/
export function prove(secret: bigint, salt: bigint): any;
/**
* @param {any} image
* @param {any} proof
* @returns {boolean}
*/
export function verify(image: any, proof: any): boolean;
/**
* @param {any[]} set
* @param {bigint} secret
* @param {bigint} salt
* @returns {any}
*/
export function prove_set_membership(set: any[], secret: bigint, salt: bigint): any;
/**
* @param {any[]} set
* @param {any} proof
* @returns {boolean}
*/
export function verify_set_membership(set: any[], proof: any): boolean;
