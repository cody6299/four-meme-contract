task("verify:AstherusTimelock", "verify AstherusTimelock on etherscan")
    .setAction(async () => {
        const {ASTHERUS} = require('../../config/business/astherus.js');
        const {proposer, executor} = await getNamedAccounts();
        const AstherusTimelock = await ethers.getContract('AstherusTimelock');
        await hre.run(
            "verify:verify", 
            {
                address: AstherusTimelock.target, 
                constructorArguments: [
                    ASTHERUS.TimeLock.minDelay,
                    ASTHERUS.TimeLock.maxDelay,
                    [proposer],
                    [executor],
                ]
            }
        );
    });

module.exports = {};
