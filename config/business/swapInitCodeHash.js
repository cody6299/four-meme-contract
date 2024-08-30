const initCodeHash = {
    default: '0x53ad3791302df9514a66a07771cad70fafb107a053d6ed7565a5ccef4dea691b',
    bsctest: '',
    bscmain: '',
}

module.exports.SWAP_INIT_CODE_HASH = initCodeHash[hre.network.name] ? initCodeHash[hre.network.name] : initCodeHash.default;
