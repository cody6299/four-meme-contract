module.exports = async function ({ 
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts 
}) {
    const { deploy } = deployments
    const { deployer } = await ethers.getNamedSigners()

    await deploy('MockUSDT', {
        from: deployer.address,
        args: ['USDT', 'USDT', '18'],
        log: true,
        contract: 'MockERC20',
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['MockUSDT', "mock"]
module.exports.dependencies = []
