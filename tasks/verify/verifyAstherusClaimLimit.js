task("verify:AstherusClaimLimit", "verify AstherusClaimLimit on etherscan")
    .setAction(async () => {
        const {ASTHERUS} = require('../../config/business/astherus.js');
        const {multisig, keeper} = await getNamedAccounts();
        const AstherusClaimLimit = await ethers.getContract('AstherusClaimLimit');
        await hre.run(
            "verify:verify", 
            {
                address: AstherusClaimLimit.target, 
                constructorArguments: [
                    multisig,
                    keeper,
                ]
            }
        );
    });

module.exports = {};
