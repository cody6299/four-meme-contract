const {getAddresses} = require('../config/system/utils.js');
const {SWAP_INIT_CODE_HASH} = require('../config/business/swapInitCodeHash.js');
const {FACTORY} = require('../config/business/factory.js');
module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const {VoteToken, BaseToken} = await getAddresses();
    const {feeReceiver, admin, manager, keeper} = await getNamedAccounts();

    const ActivityImplementation = await ethers.getContract('ActivityImplementation');

    const deployment = await deploy('Factory', {
        from: deployer, 
        args: [], 
        log: true, 
        skipIfAlreadyDeployed: true,
        proxy: {
            proxyContract: 'UUPS',
            execute: {
                init: {
                    methodName: 'initialize', 
                    args: [
                        FACTORY.defaultDecimals,
                        ActivityImplementation.target,
                        FACTORY.createFee,
                        feeReceiver,
                        FACTORY.spotTokenPercent,
                        FACTORY.baseTokenAmount,
                        admin,
                        manager,
                        keeper
                    ],
                },
            },
            upgradeFunction: {
                methodName: 'upgradeToAndCall', 
                upgradeArgs: [
                    '{implementation}', 
                    '0x'
                ]
            }
        }
    });
};

module.exports.tags = ['Factory'];
module.exports.dependencies = ['ActivityImplementation'];
