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

  const gasPrice = ((+chainId) == 1) ? 25000000000 : 1;

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

  await deploy('DelegateCallProxyManager', 'proxyManager', {
    from: deployer,
    gas: 4000000,
    gasPrice,
    args: []
  });
};

module.exports.tags = ['Core'];