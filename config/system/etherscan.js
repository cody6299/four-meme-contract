module.exports.ETHERSCAN = {
    apiKey: {
        bsc: process.env.ETHERSCAN_API_KEY_BSC,
        bscTestnet: process.env.ETHERSCAN_API_KEY_BSC,
        mainnet: process.env.ETHERSCAN_API_KEY_ETH,
        sepolia: process.env.ETHERSCAN_API_KEY_ETH,
        scroll: process.env.ETHERSCAN_API_KEY_SCROLL,
        scrollSepolia: process.env.ETHERSCAN_API_KEY_SCROLL,
    },
    customChains: [
        {
            network: "scroll", 
            chainId: 534352,
            urls: {
                apiURL: "https://api.scrollscan.com/api",
                browserURL: "https://scrollscan.com/",
            }
        }, 
        {
            network: "scrollSepolia", 
            chainId: 534351,
            urls: {
                apiURL: "https://api-sepolia.scrollscan.com/api",
                browserURL: "https://sepolia.scrollscan.com/",
            }
        }, 
    ]
}
