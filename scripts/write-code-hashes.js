const fs = require('fs');
const path = require('path');
const { soliditySha3 } = require('web3-utils');

const isCoverage = Boolean(process.env.IS_COVERAGE);

const artifactsDir = path.join(__dirname, '..', 'artifacts');
const toCodeHash = (file) => isCoverage
  ? `keccak256(type(${file}).creationCode)`
  : soliditySha3(require(path.join(artifactsDir, `${file}.json`)).bytecode);

const ONE_TO_ONE_CODEHASH = toCodeHash('DelegateCallProxyOneToOne');
const MANY_TO_ONE_CODEHASH = toCodeHash('DelegateCallProxyManyToOne');
const IMPLEMENTATION_HOLDER_CODEHASH = toCodeHash('ManyToOneImplementationHolder');

const imports = isCoverage ? `import "./ManyToOneImplementationHolder.sol";
import { DelegateCallProxyManyToOne } from "./DelegateCallProxyManyToOne.sol";
import { DelegateCallProxyOneToOne } from "./DelegateCallProxyOneToOne.sol";
` : '';

const CodeHashesLibrary = `// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;
${imports}

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