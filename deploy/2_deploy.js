const chalk = require('chalk');
const moment = require('moment');

const logger = {
  info(v) {
    console.log(
      chalk.bold.cyan(
        '@indexed-finance/core/deploy:' + moment(new Date()).format('HH:mm:ss') + ': '
      ) + v
    );
    return v;
  }
};

module.exports = async ({
  deployments,
  getNamedAccounts,
  getChainId
}) => {
  const { save } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const gasPrice = ((+chainId) == 1) ? 150000000000 : undefined;

  const deploy = async (name, contractName, opts) => {
    logger.info(`Deploying ${contractName} [${name}]`);
    const deployment = await deployments.deploy(name, {
      ...opts,
      contractName
    });
    if (deployment.newlyDeployed) {
      await save(contractName, deployment);
    }
    return deployment;
  };

  const proxyManager = '0xD23DeDC599bD56767e42D48484d6Ca96ab01C115';

  await deploy('ProxyManagerAccessControl', 'accessControl', {
    from: deployer,
    gas: 4000000,
    gasPrice,
    args: [proxyManager]
  });
};

module.exports.tags = ['ProxyManagerAccessControl'];