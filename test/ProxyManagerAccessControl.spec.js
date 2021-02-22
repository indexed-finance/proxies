const { ethers } = require("@nomiclabs/buidler");
const { expect } = require("chai");
const { keccak256 } = require("ethers/lib/utils");

const deploy = (name, ...args) => ethers.getContractFactory(name)
  .then(factory => factory.deploy(...args));

const sha3 = (value) => keccak256(Buffer.from(value));

const id1 = sha3('MockProxyLogic1.sol');
const id2 = sha3('MockProxyLogic2.sol');

describe('ProxyManagerAccessControl', async () => {
  let access, manager;
  let logic1, logic2;
  let owner, admin, notOwner;

  before(async () => {
    ([owner, admin, notOwner] = await ethers.getSigners()
    .then(async (signers) => Promise.all(
      signers.map(async (signer) => Object.assign(signer, { address: await signer.getAddress() })))
    ));
    logic1 = await deploy('MockProxyLogic1');
    logic2 = await deploy('MockProxyLogic2');
  })

  function setupTests() {
    before(async () => {
      manager = await deploy('DelegateCallProxyManager');
      access = await deploy('ProxyManagerAccessControl', manager.address);
      await manager.transferOwnership(access.address);
    });
  }

  describe('proxyManager()', () => {
    setupTests();

    it('Has correct account', async () => {
      expect(await access.proxyManager()).to.eq(manager.address);
    })
  })

  describe('grantAdminAccess()', () => {
    setupTests();

    it('Reverts if not called by owner', async () => {
      await access.grantAdminAccess(admin.address);
      expect(await access.hasAdminAccess(admin.address)).to.be.true;
    });

    it('Marks account as admin', async () => {
      await access.grantAdminAccess(admin.address);
      expect(await access.hasAdminAccess(admin.address)).to.be.true;
    });
  })

  describe('revokeAdminAccess()', () => {
    setupTests();

    it('Reverts if not called by owner', async () => {
      await expect(
        access.connect(notOwner).revokeAdminAccess(notOwner.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Marks account as not admin', async () => {
      await access.grantAdminAccess(admin.address);
      expect(await access.hasAdminAccess(admin.address)).to.be.true;
      await access.revokeAdminAccess(admin.address);
      expect(await access.hasAdminAccess(admin.address)).to.be.false;
    });
  })

  describe('approveDeployer()', () => {
    setupTests();

    it('Reverts if not called by owner or admin', async () => {
      await expect(
        access.connect(notOwner).approveDeployer(notOwner.address)
      ).to.be.revertedWith('ERR_NOT_ADMIN_OR_OWNER');
    })

    it('Grants deployer approval', async () => {
      await access.approveDeployer(admin.address);
      expect(await manager.isApprovedDeployer(admin.address)).to.be.true;
    });

    it('Can be called by admin', async () => {
      await access.grantAdminAccess(admin.address);
      await access.connect(admin).approveDeployer(admin.address);
      expect(await manager.isApprovedDeployer(admin.address)).to.be.true;
    })
  })

  describe('revokeDeployerApproval()', () => {
    setupTests();

    it('Reverts if called by non-owner', async () => {
      await access.approveDeployer(admin.address);
      await expect(
        access.connect(admin).revokeDeployerApproval(notOwner.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('Revokes deployer approval', async () => {
      await access.approveDeployer(admin.address);
      expect(await manager.isApprovedDeployer(admin.address)).to.be.true;
      await access.revokeDeployerApproval(admin.address);
      expect(await manager.isApprovedDeployer(admin.address)).to.be.false;
    });
  })

  describe('createManyToOneProxyRelationship()', () => {
    setupTests();

    it('Reverts if not called by admin or owner', async () => {
      await expect(
        access.connect(notOwner).createManyToOneProxyRelationship(id1, logic1.address)
      ).to.be.revertedWith('ERR_NOT_ADMIN_OR_OWNER');
    });

    it('Creates an implementation holder', async () => {
      await access.createManyToOneProxyRelationship(id1, logic1.address);
      const holder = await manager['getImplementationHolder(bytes32)'](id1);
      const expectedHolder = await manager.computeHolderAddressManyToOne(id1);
      expect(holder).to.eq(expectedHolder);
    });

    it('Can be called by admin', async () => {
      await access.grantAdminAccess(admin.address);
      await access.connect(admin).createManyToOneProxyRelationship(id2, logic2.address);
      const holder = await manager['getImplementationHolder(bytes32)'](id2);
      const expectedHolder = await manager.computeHolderAddressManyToOne(id2);
      expect(holder).to.eq(expectedHolder);
    });
  })

  describe('lockImplementationManyToOne()', () => {
    setupTests();

    it('Reverts if not called by owner', async () => {
      await access.createManyToOneProxyRelationship(id1, logic1.address);
      await expect(
        access.connect(admin).lockImplementationManyToOne(id1)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('Locks the implementation', async () => {
      await access.lockImplementationManyToOne(id1);
      expect(await manager['isImplementationLocked(bytes32)'](id1)).to.be.true;
    })
  })

  describe('lockImplementationOneToOne()', () => {
    setupTests();

    it('Reverts if not called by owner', async () => {
      await access.deployProxyOneToOne(id1, logic1.address);
      const address = await manager.computeProxyAddressOneToOne(access.address, id1);
      await expect(
        access.connect(admin).lockImplementationOneToOne(address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('Locks the implementation', async () => {
      const address = await manager.computeProxyAddressOneToOne(access.address, id1);
      await access.lockImplementationOneToOne(address);
      expect(await manager['isImplementationLocked(address)'](address)).to.be.true;
    })
  })

  describe('setImplementationAddressManyToOne()', () => {
    setupTests();

    it('Reverts if not called by owner', async () => {
      await access.createManyToOneProxyRelationship(id1, logic1.address);
      await expect(
        access.connect(admin).setImplementationAddressManyToOne(id1, logic2.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('Updates the implementation address', async () => {
      await access.deployProxyManyToOne(id1, id2);
      const address = await manager.computeProxyAddressManyToOne(access.address, id1, id2);
      const proxy = await ethers.getContractAt('MockProxyLogic1', address);
      await proxy.incrementValue();
      expect(await proxy.getValue()).to.eq(1);
      await access.setImplementationAddressManyToOne(id1, logic2.address);
      await proxy.incrementValue();
      expect(await proxy.getValue()).to.eq(3);
    })
  })

  describe('setImplementationAddressOneToOne()', () => {
    setupTests();

    it('Reverts if not called by owner', async () => {
      await access.deployProxyOneToOne(id1, logic1.address);
      const address = await manager.computeProxyAddressOneToOne(access.address, id1);
      await expect(
        access.connect(admin).setImplementationAddressOneToOne(address, logic2.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('Updates the implementation address', async () => {
      const address = await manager.computeProxyAddressOneToOne(access.address, id1);
      const proxy = await ethers.getContractAt('MockProxyLogic1', address);
      await proxy.incrementValue();
      expect(await proxy.getValue()).to.eq(1);
      await access.setImplementationAddressOneToOne(address, logic2.address);
      await proxy.incrementValue();
      expect(await proxy.getValue()).to.eq(3);
    })
  })

  describe('deployProxyOneToOne()', () => {
    setupTests();

    it('Reverts if not called by owner or admin', async () => {
      await expect(
        access.connect(notOwner).deployProxyOneToOne(id1, logic1.address)
      ).to.be.revertedWith('ERR_NOT_ADMIN_OR_OWNER');
    })

    it('Deploys 1t1 proxy', async () => {
      await access.deployProxyOneToOne(id1, logic1.address);
      const address = await manager.computeProxyAddressOneToOne(access.address, id1);
      const proxy = await ethers.getContractAt('MockProxyLogic1', address);
      await proxy.incrementValue();
      expect(await proxy.getValue()).to.eq(1);
    })
  })

  describe('deployProxyManyToOne()', () => {
    setupTests();

    it('Reverts if not called by owner or admin', async () => {
      await access.createManyToOneProxyRelationship(id1, logic1.address);
      await expect(
        access.connect(notOwner).deployProxyManyToOne(id1, id2)
      ).to.be.revertedWith('ERR_NOT_ADMIN_OR_OWNER');
    })

    it('Deploys mt1 proxy', async () => {
      await access.deployProxyManyToOne(id1, id2);
      const address = await manager.computeProxyAddressManyToOne(access.address, id1, id2);
      const proxy = await ethers.getContractAt('MockProxyLogic1', address);
      await proxy.incrementValue();
      expect(await proxy.getValue()).to.eq(1);
    })
  })

  describe('transferManagerOwnership()', () => {
    setupTests();

    it('Reverts if not called by owner or admin', async () => {
      await expect(
        access.connect(notOwner).transferManagerOwnership(admin.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('Transfers ownership of the proxy manager', async () => {
      await access.transferManagerOwnership(admin.address);
      expect(await manager.owner()).to.eq(admin.address)
    })
  })
});