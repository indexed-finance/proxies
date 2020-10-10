const chai = require("chai");
const { expect } = chai;

const { soliditySha3, toBN } = require('web3-utils');

describe('Mock Proxy Factory', async () => {
  let proxyManager;
  let proxyAddress, from;
  let implementation1, implementation2;
  let proxy;
  let salt, implementationID;

  before(async () => {
    const Impl1 = await ethers.getContractFactory("MockProxyLogic1");
    implementation1 = await Impl1.deploy();
    const Impl2 = await ethers.getContractFactory("MockProxyLogic2");
    implementation2 = await Impl2.deploy();
    const factory = await ethers.getContractFactory("DelegateCallProxyManager");
    proxyManager = await factory.deploy();
    ({ deployer: from } = await getNamedAccounts());
    salt = soliditySha3('ProxyLogic.sol');
    implementationID = soliditySha3('ProxyLogic.sol');
  });

  describe('One-to-one', async () => {
    it('Creates a one-to-one proxy', async () => {
      const receipt = await proxyManager.deployProxyOneToOne(
        salt,
        implementation1.address
      ).then(r => r.wait());
      expect(receipt.events.length).to.eq(1);
      proxyAddress = receipt.events[0].args.proxyAddress;
      proxy = await ethers.getContractAt('MockProxyLogic1', proxyAddress);
    });
    
    it('Proxy forwards calls to implementation address', async () => {
      await proxy.incrementValue();
      let val = await proxy.getValue();
      expect(val).to.eq('1');
      expect(await implementation1.getValue()).to.eq('0')
    });

    it('Updates the implementation address', async () => {
      const receipt = await proxyManager.setImplementationAddressOneToOne(
        proxyAddress,
        implementation2.address
      ).then(r => r.wait());
      expect(receipt.events.length).to.eq(1);
    });

    it('Proxy uses the new implementation', async () => {
      await proxy.incrementValue();
      let val = await proxy.getValue();
      expect(val).to.eq('3');
      expect(await implementation2.getValue()).to.eq('0')
    });
  });

  describe('Many-to-one', async () => {
    let proxyAddress1, proxyAddress2;
    let proxy1, proxy2;

    it('Creates a many-to-one relationship', async () => {
      const receipt = await proxyManager.createManyToOneProxyRelationship(
        implementationID,
        implementation1.address
      ).then(r => r.wait());
      expect(receipt.events.length).to.eq(1);
    });

    it('Deploys 2 many-to-one proxies', async () => {
      let receipt = await proxyManager.deployProxyManyToOne(
        implementationID,
        soliditySha3('proxy-one')
      ).then(r => r.wait());
      expect(receipt.events.length).to.eq(1);
      proxyAddress1 = receipt.events[0].args.proxyAddress;
      proxy1 = await ethers.getContractAt('MockProxyLogic1', proxyAddress1);
      receipt = await proxyManager.deployProxyManyToOne(
        implementationID,
        soliditySha3('proxy-two')
      ).then(r => r.wait());
      expect(receipt.events.length).to.eq(1);
      proxyAddress2 = receipt.events[0].args.proxyAddress;
      proxy2 = await ethers.getContractAt('MockProxyLogic1', proxyAddress2);
    });

    it('Proxies forward calls to implementation address', async () => {
      await proxy1.incrementValue();
      expect(await proxy1.getValue()).to.eq('1');
      await proxy2.incrementValue();
      expect(await proxy2.getValue()).to.eq('1');
      expect(await implementation1.getValue()).to.eq('0');
    });

    it('Updates the implementation address', async () => {
      const receipt = await proxyManager.setImplementationAddressManyToOne(
        implementationID,
        implementation2.address
      ).then(r => r.wait());
      expect(receipt.events.length).to.eq(1);
    });

    it('Proxies forward calls to new implementation address', async () => {
      await proxy1.incrementValue();
      expect(toBN(await proxy1.getValue()).toNumber()).to.eq('3');
      await proxy2.incrementValue();
      expect(await proxy2.getValue()).to.eq('3');
      expect(await implementation2.getValue()).to.eq('0');
    });

    describe('Approved deployers', async () => {
      let mockDeployer;
  
      before(async () => {
        const MockDeployer = await ethers.getContractFactory('ApprovalTest');
        mockDeployer = await MockDeployer.deploy();
      });

      it('Approves a contract to deploy many-to-one proxies', async () => {
        await proxyManager.approveDeployer(mockDeployer.address);
      });

      it('Deploys from approved address', async () => {
        await mockDeployer.deploy(
          proxyManager.address,
          soliditySha3('test-proxy-approval')
        );
      });
    });
  });
});