module.exports = async function ({ 
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts 
}) {
    const { deploy } = deployments
    const { deployer } = await ethers.getNamedSigners()

    await deploy('MockSwapFactory', {
        from: deployer.address,
        args: [deployer.address],
        log: true,
        contract: 'PancakeFactory',
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['MockSwapFactory', "mock"]
module.exports.dependencies = []
