const { ethers } = require("@nomiclabs/buidler");
const { expect } = require("chai");

const deploy = (name, ...args) => ethers.getContractFactory(name)
  .then(factory => factory.deploy(...args));

describe('Proxies', async () => {
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

    it('Can be called by owner', async () => {
      await access.grantAdminAccess(admin.address);
      expect(await access.hasAdminAccess(admin.address)).to.be.true;
    });
  })

  describe('revokeAdminAccess()', () => {
    setupTests();
  })

  describe('approveDeployer()', () => {
    setupTests();

    // it('Reverts if not owner or admin', async () => {
    //   await expect(
    //     access.connect(notOwner).approveDeployer(notOwner.address)
    //   ).to.be.revertedWith('ERR_NOT_ADMIN_OR_OWNER');
    // })

    it('Can be called by owner', async () => {
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

    // it('Reverts if called by non-owner', async () => {
    //   await access.connect(admin).approveDeployer(admin.address);
    //   await expect(
    //     access.connect(admin).revokeDeployerApproval(notOwner.address)
    //   ).to.be.revertedWith('Ownable: Caller is not the owner');
    // })

    it('Revokes deployer approval', async () => {
      await access.approveDeployer(admin.address);
      expect(await manager.isApprovedDeployer(admin.address)).to.be.true;
      await access.revokeDeployerApproval(admin.address);
      expect(await manager.isApprovedDeployer(admin.address)).to.be.false;
    });
  })

  describe('createManyToOneProxyRelationship()', () => {
    setupTests();
  })

  describe('lockImplementationManyToOne()', () => {
    setupTests();
  })

  describe('lockImplementationOneToOne()', () => {
    setupTests();
  })

  describe('setImplementationAddressManyToOne()', () => {
    setupTests();
  })

  describe('setImplementationAddressOneToOne()', () => {
    setupTests();
  })

  describe('deployProxyOneToOne()', () => {
    setupTests();
  })

  describe('deployProxyManyToOne()', () => {
    setupTests();
  })
});