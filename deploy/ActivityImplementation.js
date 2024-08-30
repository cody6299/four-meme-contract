const {getAddresses} = require('../config/system/utils.js');
const {SWAP_INIT_CODE_HASH} = require('../config/business/swapInitCodeHash.js');
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
    const {SwapFactory, SwapRouter, LpLocker} = await getAddresses();
    /*
    const SwapFactoryContract = await ethers.getContractAt('PancakeFactory', SwapFactory);
    const INIT_CODE_PAIR_HASH = await SwapFactoryContract.INIT_CODE_PAIR_HASH();
    console.log(INIT_CODE_PAIR_HASH);
    */

    const deployment = await deploy('ActivityImplementation', {
        contract: "Activity",
        from: deployer, 
        args: [
            VoteToken,
            BaseToken,
            SwapFactory,
            SwapRouter,
            SWAP_INIT_CODE_HASH,
            LpLocker,
        ], 
        log: true, 
        skipIfAlreadyDeployed: true,
    });

    //constructor(IERC20 voteToken, IERC20 baseToken, ISwapFactory swapFactory, ISwapRouter swapRouter, bytes32 pairInitCodeHash, IUniswapV2Locker lpLocker) {
};

module.exports.tags = ['ActivityImplementation'];
module.exports.dependencies = [];
if (hre.network.tags.local) {
    module.exports.dependencies.push('mock');
}
