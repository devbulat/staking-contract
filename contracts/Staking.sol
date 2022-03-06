//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./ERC20Mock.sol";

contract Staking {
    address private _owner;
    IERC20Mock private _stakingToken;
    IERC20Mock private _rewardToken;
    uint256 public _rewardPercentage;
    uint256 public _rewardTime;
    uint256 public _unstakeTime;
    mapping(address => uint256) private _balances;
    mapping(address => bool) private _rewards;
    mapping(address => uint256) private _timestamps;

    constructor(address stakingToken, address rewardToken, uint256 rewardPercentage, uint256 rewardTime, uint unstakeTime) {
        _owner = msg.sender;
        _stakingToken = IERC20Mock(stakingToken);
        _rewardToken = IERC20Mock(rewardToken);
        _rewardPercentage = rewardPercentage;
        _rewardTime = rewardTime;
        _unstakeTime = unstakeTime;
    }

    function stake(uint256 amount) external {
        require(amount != 0, "Can't stake zero amount");

        _stakingToken.transferFrom(msg.sender, address(this), amount);
        _balances[msg.sender] += amount;
        _timestamps[msg.sender] = block.timestamp;
    }

    function unstake() external {
        require(block.timestamp - _timestamps[msg.sender] > _unstakeTime, "Not ready for unstake");
        require(_balances[msg.sender] != 0, "You have nothing for unstake");

        uint256 amount = _balances[msg.sender];
        _balances[msg.sender] = 0;
        _stakingToken.transfer(msg.sender, amount);
    }

    function claim() external {
        require(block.timestamp - _timestamps[msg.sender] > _unstakeTime, "Not ready for claim");
        require(!_rewards[msg.sender], "Already claimed");

        uint stakedBalance = _balances[msg.sender];
        uint amount = (stakedBalance/100)*_rewardPercentage;
        _rewardToken.transfer(msg.sender, amount);
        _rewards[msg.sender] = true;
    }

    function getBalance(address stakeHolder) external view returns(uint256) {
        require(stakeHolder != address(0), "Can't get balance from zero address");
        
        return _balances[stakeHolder];
    }

    function getRewardTime() external view returns(uint256) {
        require(_owner == msg.sender, "You are not owner");

        return _rewardTime;
    }

    function setRewardTime(uint256 time) external {
        require(_owner == msg.sender, "You are not owner");

        _rewardTime = time;
    }

    function getRewardPercentage() external view returns(uint256) {
        require(_owner == msg.sender, "You are not owner");

        return _rewardPercentage;
    }

    function setRewardPersentage(uint256 percentage) external {
        require(_owner == msg.sender, "You are not owner");

        _rewardPercentage = percentage;
    }
}
