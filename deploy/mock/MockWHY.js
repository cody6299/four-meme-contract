module.exports = async function ({ 
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts 
}) {
    const { deploy } = deployments
    const { deployer } = await ethers.getNamedSigners()

    await deploy('MockWHY', {
        from: deployer.address,
        args: ['WHY',  'WHT', '18'],
        log: true,
        contract: 'MockERC20',
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['MockWHY', "mock"]
module.exports.dependencies = []
