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
    const MockWETH = await ethers.getContract('MockWETH');
    await deploy('MockSwapRouter', {
        from: deployer.address,
        args: [MockSwapFactory.target, MockWETH.target],
        log: true,
        contract: 'PancakeRouter',
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['MockSwapRouter', "mock"]
module.exports.dependencies = ['MockSwapFactory', 'MockWETH']
