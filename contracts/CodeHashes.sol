// SPDX-License-Identifier: GPL-3.0
pragma solidity =0.6.12;


/**
 * @dev Because we use the code hashes of the proxy contracts for proxy address
 * derivation, it is important that other packages have access to the correct
 * values when they import the salt library.
 */
library CodeHashes {
  bytes32 internal constant ONE_TO_ONE_CODEHASH = 0x980843d7182154db438d410718903ca4c4116c8f430643d49eb654ed1776ed41;
  bytes32 internal constant MANY_TO_ONE_CODEHASH = 0xb4e09618634e1d4fad81090ab8fb8259b749a9202aa02d7720af654b9b4ca17b;
  bytes32 internal constant IMPLEMENTATION_HOLDER_CODEHASH = 0xfc7aed17e5c5d36a15e443235cb9c59bae4a013202cde6ab3e657fa1176d7f3e;
}