const {NETWORKS} = require('./networks.js');

const users = {
    default: {
        deployer: 0,
        feeReceiver: 1,
        admin: 2,
        manager: 3,
        keeper: 4,
    },
    bsctest: {
        deployer: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
    },
    bscmain: {
        deployer: process.env.MAINNET_DEPLOYER ? process.env.MAINNET_DEPLOYER : 0,
    },
}

let exportUsers = {}
for (let network in users) {
    if (network != 'default' && (NETWORKS[network] == null || NETWORKS[network].chainId == null)) {
        throw new Error(`user config error: network ${network} not exists, config it in networks.js first`);
    }
    let chainId = network == 'default' ? 'default' : NETWORKS[network].chainId;
    let userAddresses = users[network];
    for (user in userAddresses) {
        if (exportUsers[user] == null) {
            exportUsers[user] = {};
        }
        exportUsers[user][chainId] = userAddresses[user];
    }
}

module.exports.USERS = exportUsers;
