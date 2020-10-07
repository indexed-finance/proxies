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
  getChainId,
  getNamedAccounts,
  ethers
}) => {
  const { save } = deployments;
  const { deployer } = await getNamedAccounts();

  // For some reason the contractName field wasn't properly being saved to deployments.
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

  logger.info('Executing deployment script.');

  await deploy('DelegateCallProxyManager', 'proxyManager', {
    from: deployer,
    gas: 4000000,
    args: []
  });
};

module.exports.tags = ['Core'];