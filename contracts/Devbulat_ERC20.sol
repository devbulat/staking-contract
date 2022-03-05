//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";


contract DevbulatERC20 {
    address private _owner;
    string private _name;
    string private _symbol;
    uint256 private _decimals;
    uint256 private _totalSupply;
    mapping (address => uint) private _balances;
    mapping (address => mapping (address => uint)) private _allowances;
    event Transfer(address indexed from, address indexed to, uint value);

    constructor(string memory tokenName, string memory tokenSymbol, uint256 tokenDecimals) {
         _owner = msg.sender;
         _name = tokenName;
         _symbol = tokenSymbol;
         _decimals = tokenDecimals;
    }

    function mint(address recipient, uint256 amount) external {
        require(_owner == msg.sender, "You are not owner");
        require(recipient != address(0), "Can't mint to zero address");
        require(amount != 0, "Can't mint zero amount");

        _balances[recipient] += amount;
        _totalSupply += amount;
        
        emit Transfer(address(0), recipient, amount);
    }

    function burn(address recipient, uint256 amount) external {
        require(_owner == msg.sender, "You are not owner");
        require(recipient != address(0), "Can't burn from zero address");
        require(amount != 0, "Can't burn zero amount");

        _balances[recipient] -= amount;
        _totalSupply -= amount;

        emit Transfer(recipient, address(0), amount);
    }

    function transfer(address recipient, uint256 amount ) external {
        require(amount <= _balances[msg.sender], "Not enough tokens");
        require(recipient != address(0), "Can't transfer to zero address");
        require(amount != 0, "Can't transfer zero amount");

        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
    }

    function transferFrom(address sender, address recipient, uint256 amount ) external {
        require(amount <= allowance(sender, recipient), "Not approved");
        require(amount <= _balances[sender], "Not enough tokens");
        require(sender != address(0), "Can't transfer from zero address");
        require(recipient != address(0), "Can't transfer to zero address");
        require(amount != 0, "Can't transfer zero amount");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        _allowances[sender][recipient] -= amount;
    }

    function approve(address spender, uint256 amount ) external {
        require(spender != address(0), "Can't add allowance to zero address");
        require(amount != 0, "Can't add allowance for zero amount");

        _allowances[msg.sender][spender] = amount;
    }

    function increaseAllowance(address spender, uint256 amount ) external {
        require(spender != address(0), "Can't increase allowance to zero address");
        require(amount != 0, "Can't increase allowance with zero amount");

        _allowances[msg.sender][spender] += amount;
    }

    function decreaseAllowance(address spender, uint256 amount ) external {
        require(spender != address(0), "Can't decrease allowance to zero address");
        require(amount != 0, "Can't decrease allowance with zero amount");

        _allowances[msg.sender][spender] = amount > _allowances[msg.sender][spender] ? 0 : _allowances[msg.sender][spender] - amount;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        require(owner != address(0), "Can't add allowance for zero owners address");
        require(spender != address(0), "Can't add allowance for zero spenders address");

        return _allowances[owner][spender];
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function decimals() external view returns (uint256) {
        return _decimals;
    }

    function balanceOf(address user) external view returns (uint256) {
        return _balances[user];
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
}
