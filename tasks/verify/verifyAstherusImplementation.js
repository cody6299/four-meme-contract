task("verify:AstherusImplementation", "verify AstherusImplementation on etherscan")
    .setAction(async () => {
        const AstherusTimelock = await ethers.getContract('AstherusTimelock');
        const AstherusImplementation = await ethers.getContract('AstherusVault_Implementation')
        await hre.run(
            "verify:verify", 
            {
                address: AstherusImplementation.target, constructorArguments: [AstherusTimelock.target]
            }
        );
    });

module.exports = {};
