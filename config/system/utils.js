const {TOKENS} = require('./tokens.js');
//const {CONTRACTS} = require('./contracts.js');
const {USERS} = require('./users.js');
const getAddresses = async function() {
    let res = {};
    let chainId = await hre.getChainId();
    for (let name in TOKENS) {
        let addr = TOKENS[name][chainId] == null ? TOKENS[name]['default'] : TOKENS[name][chainId];
        if (addr == null) {
            continue;
        }
        try {
            if (ethers.isAddress(addr)) {
                res[name] = addr;
            } else if (Number.isInteger(addr)) {
                res[name] = (await ethers.getSigners())[addr].address;
            } else {
                res[name] = (await ethers.getContract(addr)).target;
            }
        } catch (err) {
            console.log(err)
            continue;
        }
    }
    /*
    for (let name in CONTRACTS) {
        let addr = CONTRACTS[name][chainId] == null ? CONTRACTS[name]['default'] : CONTRACTS[name][chainId];
        if (addr == null) {
            continue;
        }
        try {
            if (ethers.isAddress(addr)) {
                res[name] = addr;
            } else if (Number.isInteger(addr)) {
                res[name] = (await ethers.getSigners())[addr].address;
            } else {
                res[name] = (await ethers.getContract(addr)).target;
            }
        } catch (err) {
            continue;
        }
    }
    */
    for (let name in USERS) {
        let addr = USERS[name][chainId] == null ? USERS[name]['default'] : USERS[name][chainId];
        if (addr == null) {
            continue;
        }
        try {
            if (ethers.isAddress(addr)) {
                res[name] = addr;
            } else if (Number.isInteger(addr)) {
                res[name] = (await ethers.getSigners())[addr].address;
            } else {
                res[name] = (await ethers.getContract(addr)).target;
            }
        } catch (err) {
            continue;
        }
    }
    return res;
}

module.exports = {
    getAddresses,
}
