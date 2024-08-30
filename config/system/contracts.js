const {NETWORKS} = require('./networks.js');

const contracts = {
    default: {
        SwapFactory: 'MockSwapFactory',
        SwapRouter: 'MockSwapRouter',
        LpLocker: 'MockLpLocker',
    },
    bsctest: {
        Pyth: '0x5744Cbf430D99456a0A8771208b674F27f8EF0Fb',
    },
    bscmain: {
        Pyth: '0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594',
    },
}

let exportContracts = {}
for (network in contracts) {
    if (network != 'default' && (NETWORKS[network] == null || NETWORKS[network].chainId == null)) {
        throw new Error(`contract config error: network ${network} not exists, config it in networks.js first`);
    }
    let chainId = network == 'default' ? 'default' : NETWORKS[network].chainId;
    let contractAddresses = contracts[network];
    for (name in contractAddresses) {
        if (exportContracts[name] == null) {
            exportContracts[name] = {};
        }
        exportContracts[name][chainId] = contractAddresses[name];
    }
}

module.exports.CONTRACTS = exportContracts;
