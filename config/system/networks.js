module.exports.NETWORKS = {
    bscmain: {
        url: process.env.NODEREAL_API_KEY ? `https://bsc-mainnet.nodereal.io/v1/${process.env.NODEREAL_API_KEY}` : `https://bsc-dataseed1.defibit.io/`,
        chainId: 56,
        gasMultiplier: 3,
        tags: ["bsc", "mainnet"],
    },
    bsctest: {
        url: process.env.NODEREAL_API_KEY ? `https://bsc-testnet.nodereal.io/v1/${process.env.NODEREAL_API_KEY}` : `https://data-seed-prebsc-1-s1.binance.org:8545/`,
        chainId: 97,
        gasMultiplier: 3,
        tags: ["bsc", "testnet"],
    },
}
