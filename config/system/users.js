const {NETWORKS} = require('./networks.js');

const users = {
    default: {
        deployer: 0,
        proposer: 1,
        executor: 2,
        multisig: 3,
        keeper: 4,
    },
    bsctest: {
        deployer: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        proposer: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        executor: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        multisig: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        keeper: '0xecc9254278c4b81f0c1bf81fd39957815502889c',
    },
    bscmain: {
        deployer: process.env.MAINNET_DEPLOYER ? process.env.MAINNET_DEPLOYER : 0,
        proposer: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
        executor: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
        multisig: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
        keeper: '',
    },
    ethtest: {
        deployer: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        proposer: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        executor: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        multisig: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        keeper: '0xecc9254278c4b81f0c1bf81fd39957815502889c',
    },
    ethmain: {
        deployer: process.env.MAINNET_DEPLOYER ? process.env.MAINNET_DEPLOYER : 0,
        proposer: '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA',
        executor: '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA',
        multisig: '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA',
        keeper: '',
    },
    scrolltest: {
        deployer: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        proposer: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        executor: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        multisig: process.env.TESTNET_DEPLOYER ? process.env.TESTNET_DEPLOYER : 0,
        keeper: '0xecc9254278c4b81f0c1bf81fd39957815502889c',
    },
    scrollmain: {
        deployer: process.env.MAINNET_DEPLOYER ? process.env.MAINNET_DEPLOYER : 0,
        proposer: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
        executor: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
        multisig: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
        keeper: '',
    },
}

let exportUsers = {}
for (network in users) {
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
