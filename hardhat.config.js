require("dotenv/config")
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require('hardhat-abi-exporter');
require('hardhat-log-remover');
require("dotenv/config")
require("@nomicfoundation/hardhat-verify");
require('./tasks/verify/index.js');
require('./tasks/update/index.js');
require('hardhat-spdx-license-identifier');

const {NETWORKS} = require('./config/system/networks.js');
const {COMPILIERS} = require('./config/system/compiliers.js');
const {USERS} = require('./config/system/users.js');
const {TOKENS} = require('./config/system/tokens.js');
const {ACCOUNTS} = require('./config/system/accounts.js');
const {ETHERSCAN} = require('./config/system/etherscan.js');

for (network in NETWORKS) {NETWORKS[network].accounts = ACCOUNTS;}
module.exports = {
    defaultNetwork: "hardhat",
    abiExporter: {
        path: "./abi",
        clear: false,
        flat: true,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        ...USERS,
        ...TOKENS,
    },
    networks: {
        hardhat: {
            forking: {
                enabled: process.env.FORKING_ENABLED ? true : false,
                url: process.env.FORKING_URL ? process.env.FORKING_URL : "",
                blockNumber: process.env.FORKING_BLOCK_NUMBER,
            },
            tags: ["local"],
        },
        ...NETWORKS,
    },
    solidity: {
        compilers: COMPILIERS,
    },
    spdxLicenseIdentifier: {
        overwrite: true,
        runOnCompile: true,
    },
    etherscan: ETHERSCAN,
};
