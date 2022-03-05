//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Staking {
    ERC20 private _stakingToken;
    ERC20 private _rewardToken;
    uint256 public _rewardPercentage;
    uint256 public _rewardTime;
    uint256 public _unstakeTime;
    mapping(address => uint256) private _balances;
    mapping(address => bool) private _rewards;
    mapping(address => uint256) private _timestamps;

    constructor(address stakingToken, address rewardToken, uint256 rewardPercentage, uint256 rewardTime, uint unstakeTime) {
        _stakingToken = ERC20(stakingToken);
        _rewardToken = ERC20(rewardToken);
        _rewardPercentage = rewardPercentage;
        _rewardTime = rewardTime;
        _unstakeTime = unstakeTime;
    }

    function stake(uint256 amount) external {
        _stakingToken.transferFrom(msg.sender, address(this), amount);
        _balances[msg.sender] += amount;
        _timestamps[msg.sender] = block.timestamp;
    }

    function unstake() external returns(bool) {
        if (block.timestamp - _timestamps[msg.sender] > _unstakeTime) { 
            uint256 amount = _balances[msg.sender];
            _balances[msg.sender] = 0;
            _stakingToken.transfer(msg.sender, amount);

            return true;
        }

        return false;
    }

    function claim() external returns (bool) {
        if (block.timestamp - _timestamps[msg.sender] > _rewardTime) {
            uint stakedBalance = _balances[msg.sender];
            uint amount = (stakedBalance/100)*_rewardPercentage;
            _rewardToken.transfer(msg.sender, amount);
            _rewards[msg.sender] = true;
        }

        return _rewards[msg.sender];
    }

    function getBalance(address stakeHolder) external view returns(uint256) {
        return _balances[stakeHolder];
    }
}

interface ERC20 {

    function transfer(address recipient, uint256 amount ) external; 

    function increaseAllowance(address spender, uint256 amount ) external;

    function decreaseAllowance(address spender, uint256 amount ) external;

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount ) external;
    
    function transferFrom(address sender, address recipient, uint256 amount ) external;

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint256);

    function balanceOf(address user) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint value);
}