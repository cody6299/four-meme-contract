const {NETWORKS} = require('./networks.js');

const tokens = {
    default: {
        VoteToken: 'MockWHY',
        BaseToken: 'MockWHY',
    },
    bscmain: {
    },
    bsctest: {
    },
}

let exportTokens = {}
for (let network in tokens) {
    if (network != 'default' && (NETWORKS[network] == null || NETWORKS[network].chainId == null)) {
        throw new Error(`token config error: network ${network} not exists, config it in networks.js first`);
    }
    let chainId = network == 'default' ? 'default' : NETWORKS[network].chainId;
    let tokenAddresses = tokens[network];
    for (symbol in tokenAddresses) {
        if (exportTokens[symbol] == null) {
            exportTokens[symbol] = {};
        }
        exportTokens[symbol][chainId] = tokenAddresses[symbol];
    }
}

module.exports.TOKENS = exportTokens;
