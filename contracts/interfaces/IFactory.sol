// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFactory {

    function deployERC20(string memory _name, string memory _symbol, uint256 _totalSupply) external returns (IERC20);

    function defaultDecimals() external view returns (uint8);

    function voteToken() external view returns (IERC20);

}
