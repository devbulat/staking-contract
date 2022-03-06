//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract ERC20Mock {
    address private _owner;
    string private _name;
    string private _symbol;
    uint256 private _decimals;
    mapping (address => uint) private _balances;
    event Transfer(address indexed from, address indexed to, uint value);

    constructor(string memory tokenName, string memory tokenSymbol, uint256 tokenDecimals) {
         _owner = msg.sender;
         _name = tokenName;
         _symbol = tokenSymbol;
         _decimals = tokenDecimals;
    }

    function mint(address recipient, uint256 amount) external {
        _balances[recipient] += amount;        
        emit Transfer(address(0), recipient, amount);
    }

    function transfer(address recipient, uint256 amount ) external {
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
    }

    function transferFrom(address sender, address recipient, uint256 amount ) external {
        _balances[sender] -= amount;
        _balances[recipient] += amount;
    }

    function decimals() external view returns (uint256) {
        return _decimals;
    }

    function balanceOf(address user) external view returns (uint256) {
        return _balances[user];
    }
}

interface IERC20Mock {
    function transfer(address recipient, uint256 amount ) external; 

    function transferFrom(address sender, address recipient, uint256 amount ) external;

    function decimals() external view returns (uint256);

    function balanceOf(address user) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint value);
}