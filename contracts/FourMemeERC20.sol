// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FourMemeERC20 is ERC20 {
    
    uint8 public immutable TOKEN_DECIMALS;

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply, address _receipt) ERC20(_name, _symbol) {
        TOKEN_DECIMALS = _decimals;
        _mint(_receipt, _totalSupply);
    }

    function decimals() public view virtual override(ERC20) returns (uint8) {
        return TOKEN_DECIMALS;
    }
}
