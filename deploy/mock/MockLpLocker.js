module.exports = async function ({ 
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts 
}) {
    const { deploy } = deployments
    const { deployer } = await ethers.getNamedSigners()
    const MockSwapFactory = await ethers.getContract('MockSwapFactory');
    await deploy('MockLpLocker', {
        from: deployer.address,
        args: [MockSwapFactory.target],
        log: true,
        contract: 'UniswapV2Locker',
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['MockLpLocker', "mock"]
module.exports.dependencies = ['MockSwapFactory']
