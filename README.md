# @indexed-finance/proxies

[![Build Status](https://api.travis-ci.com/indexed-finance/proxies.svg?branch=master)](https://travis-ci.com/github/indexed-finance/proxies)
[![Coverage Status](https://coveralls.io/repos/github/indexed-finance/proxies/badge.svg?branch=master)](https://coveralls.io/github/indexed-finance/proxies?branch=master)
[![npm version](https://badge.fury.io/js/%40indexed-finance%2Fproxies.svg)](https://badge.fury.io/js/%40indexed-finance%2Fproxies)

Smart contracts for upgradeable proxies.

[Documentation](https://docs.indexed.finance/indexed-finance-docs/smart-contracts/proxies)

## Install

```
npm install --save @indexed-finance/proxies
```

**Notes for developers**

If you deploy a new version of `DelegateCallProxyManager.sol` without using the artifact in /artifacts (handled automatically by buidler), your local build may result in different bytecode. If that happens, the code hashes in `CodeHashes.sol` will be incorrect and the proxy address derivation functions will not work. Either use the already built artifacts in the package or replace the codehashes with the new values. See: [script for generating the CodeHashes contract](./scripts/write-code-hashes.js)

## Test

```
npm run test
```

## Gas Report
```
npm run node
npm run benchmark
```