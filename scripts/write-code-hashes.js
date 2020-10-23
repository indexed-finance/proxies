const fs = require('fs');
const path = require('path');
const { soliditySha3 } = require('web3-utils');

const artifactsDir = path.join(__dirname, '..', 'artifacts');
const toBytecode = (file) => require(path.join(artifactsDir, file)).bytecode;

const ONE_TO_ONE_CODEHASH = soliditySha3(toBytecode('DelegateCallProxyOneToOne.json'));
const MANY_TO_ONE_CODEHASH = soliditySha3(toBytecode('DelegateCallProxyManyToOne.json'));
const IMPLEMENTATION_HOLDER_CODEHASH = soliditySha3(toBytecode('ManyToOneImplementationHolder.json'));

const CodeHashesLibrary = `// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;


/**
 * @dev Because we use the code hashes of the proxy contracts for proxy address
 * derivation, it is important that other packages have access to the correct
 * values when they import the salt library.
 */
library CodeHashes {
  bytes32 internal constant ONE_TO_ONE_CODEHASH = ${ONE_TO_ONE_CODEHASH};
  bytes32 internal constant MANY_TO_ONE_CODEHASH = ${MANY_TO_ONE_CODEHASH};
  bytes32 internal constant IMPLEMENTATION_HOLDER_CODEHASH = ${IMPLEMENTATION_HOLDER_CODEHASH};
}`;

const libraryPath = path.join(__dirname, '..', 'contracts', 'CodeHashes.sol');
fs.writeFileSync(libraryPath, CodeHashesLibrary, 'utf8');