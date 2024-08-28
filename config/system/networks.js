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
    ethmain: {
        url: `https://eth-mainnet.nodereal.io/v1/${process.env.NODEREAL_API_KEY}`,
        chainId: 1,
        tags: ['eth', 'testnet'],
    },
    ethtest: {
        url: `https://eth-sepolia.nodereal.io/v1/${process.env.NODEREAL_API_KEY}`,
        chainId: 11155111,
        tags: ['eth', 'testnet'],
    },
    scrollmain: {
        url: process.env.ANKR_API_KEY ? `https://rpc.ankr.com/scroll/${process.env.ANKR_API_KEY}` : `https://rpc.scroll.io`,
        chainId: 534352,
        tags: ['scroll', 'mainnet'],
    },
    scrolltest: {
        url: process.env.ANKR_API_KEY ? `https://rpc.ankr.com/scroll_sepolia_testnet/${process.env.ANKR_API_KEY}` : `https://sepolia-rpc.scroll.io/`,
        chainId: 534351,
        tags: ['scroll', 'testnet'],
    },
}
