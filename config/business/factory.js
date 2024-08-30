const factory = {
    default: {
        defaultDecimals: 18,
        createFee: ethers.parseEther('0.2'),
        spotTokenPercent: ethers.parseUnits('1', 4),
        baseTokenAmount: ethers.parseUnits('1000000', 18),
    },
    bsctest: {
    },
    bscmain: {
    },
}

module.exports.FACTORY = factory[hre.network.name] ? factory[hre.network.name] : factory.default;
