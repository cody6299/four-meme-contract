module.exports = async function ({ 
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts 
}) {
    const { deploy } = deployments
    const { deployer } = await ethers.getNamedSigners()

    await deploy('MockWETH', {
        from: deployer.address,
        args: [],
        log: true,
        contract: 'WBNB',
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['MockWETH', "mock"]
module.exports.dependencies = []
