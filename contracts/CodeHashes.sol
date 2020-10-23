// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;


/**
 * @dev Because we use the code hashes of the proxy contracts for proxy address
 * derivation, it is important that other packages have access to the correct
 * values when they import the salt library.
 */
library CodeHashes {
  bytes32 internal constant ONE_TO_ONE_CODEHASH = 0xfeddfba61044051906dd1a07bb1531102730bc2ac6f0a420b8126c5ba6c10cf7;
  bytes32 internal constant MANY_TO_ONE_CODEHASH = 0x2f98a80b374682a6ae977e416d9b4a15fc5c083cd80e6b70d2542ebeca2c2918;
  bytes32 internal constant IMPLEMENTATION_HOLDER_CODEHASH = 0xa558acad70fc124d64322222d54e3d36df3cfa2816409762b436d03a15018df3;
}