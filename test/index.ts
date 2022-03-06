import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { BigNumber } from 'bignumber.js';

let stakingTokenFactory: ContractFactory, 
    stakingToken: Contract, 
    stakingFactory: ContractFactory,
    stakingContract: Contract,
    rewardTokenFactory: ContractFactory,
    rewardToken: Contract,
    decimalPart: BigNumber,
    createValue: (value:number) => string;

beforeEach(async () => {
  stakingTokenFactory = await ethers.getContractFactory("ERC20Mock");
  stakingToken = await stakingTokenFactory.deploy("StakingToken", "ST", 10);
  rewardTokenFactory = await ethers.getContractFactory("ERC20Mock");
  rewardToken = await rewardTokenFactory.deploy("RewardToken", "REW", 10);

  await stakingToken.deployed();
  await rewardToken.deployed();

  const decimals = await stakingToken.decimals();
  decimalPart = new BigNumber(10).pow(decimals.toNumber());
  stakingFactory = await ethers.getContractFactory('Staking');
  stakingContract = await stakingFactory.deploy(
    stakingToken.address, 
    rewardToken.address,
    20,
    1,
    1
  );
  createValue = function(value:number) {
    return new BigNumber(value).multipliedBy(decimalPart).toFixed(0);
  }

  await stakingContract.deployed();
});

describe("Staking",  function () {
  it("Should stake tokens", async function() {
    const [owner] = await ethers.getSigners();
    const amount = createValue(5);
    await stakingToken.connect(owner).mint(owner.address, amount);
    await stakingContract.stake(amount);

    expect(await stakingContract.getBalance(owner.address)).to.be.equal(amount);
  });

  it("Should unstake tokens", async function() {
    const [owner] = await ethers.getSigners();
    const amount = createValue(5);
    await stakingToken.connect(owner).mint(owner.address, amount);
    await stakingContract.stake(amount);

    await new Promise(resolve => setTimeout(resolve, 2000));

    await stakingContract.unstake();

    expect(await stakingToken.balanceOf(owner.address)).to.be.equal(amount);
  });

  it("Shouldn't unstake tokens", async function() {
    const [owner] = await ethers.getSigners();
    const amount = createValue(5);
    await stakingToken.connect(owner).mint(owner.address, amount);
    await stakingContract.stake(amount);

    expect(stakingContract.unstake()).to.be.revertedWith("Not ready for unstake");
  });

  it("Should claim tokens", async function() {
    const [owner] = await ethers.getSigners();
    const amount = createValue(5);
    await stakingToken.connect(owner).mint(owner.address, amount);
    await rewardToken.connect(owner).mint(stakingContract.address, amount);
    await stakingContract.stake(amount);

    await new Promise(resolve => setTimeout(resolve, 2000));

    await stakingContract.claim();
 
    expect(await rewardToken.balanceOf(owner.address)).to.be.equal(createValue(1));
  });

  it("Shouldn't claim tokens, because reward is not ready", async function() {
    const [owner] = await ethers.getSigners();
    const amount = createValue(5);
    await stakingToken.connect(owner).mint(owner.address, amount);
    await rewardToken.connect(owner).mint(stakingContract.address, amount);
    await stakingContract.stake(amount);
 
    expect(stakingContract.claim()).to.be.revertedWith("Not ready for claim");
  });

  it("Shouldn't claim tokens, because reward already was claimed", async function() {
    const [owner] = await ethers.getSigners();
    const amount = createValue(5);
    await stakingToken.connect(owner).mint(owner.address, amount);
    await rewardToken.connect(owner).mint(stakingContract.address, amount);
    await stakingContract.stake(amount);

    await new Promise(resolve => setTimeout(resolve, 2000));

    await stakingContract.claim();

    expect(stakingContract.claim()).to.be.revertedWith("Already claimed");
  });

  it("Should return reward time", async function() {
    const [owner] = await ethers.getSigners();
    const rewardTime = await stakingContract.connect(owner).getRewardTime();

    expect(rewardTime).to.be.equal(ethers.BigNumber.from(1));
  });

  it("Shouldn't return reward time, beacuse it's not an admin", async function() {
    const [,addr1] = await ethers.getSigners();

    expect(stakingContract.connect(addr1).getRewardTime()).to.be.revertedWith("You are not owner");
  });
  
  it("Should change reward time", async function() {
    const [owner] = await ethers.getSigners();

    await stakingContract.connect(owner).setRewardTime(ethers.BigNumber.from(2));

    const rewardTime = await stakingContract.connect(owner).getRewardTime();

    expect(rewardTime).to.be.equal(ethers.BigNumber.from(2));
  });

  it("Shouldn't change reward time, because it's not an admin", async function() {
    const [, addr1] = await ethers.getSigners();

    expect(stakingContract.connect(addr1).setRewardTime(ethers.BigNumber.from(2))).to.be.revertedWith("You are not owner");
  });

  it("Should return reward percentage", async function() {
    const [owner] = await ethers.getSigners();
    const rewardPercentage = await stakingContract.connect(owner).getRewardPercentage();

    expect(rewardPercentage).to.be.equal(ethers.BigNumber.from(20));
  });

  it("Shouldn't return reward percentage, beacuse it's not an admin", async function() {
    const [,addr1] = await ethers.getSigners();

    expect(stakingContract.connect(addr1).getRewardPercentage()).to.be.revertedWith("You are not owner");
  });
  
  it("Should change reward percentage", async function() {
    const [owner] = await ethers.getSigners();

    await stakingContract.connect(owner).setRewardPersentage(ethers.BigNumber.from(25));

    const rewardPercentage = await stakingContract.connect(owner).getRewardPercentage();

    expect(rewardPercentage).to.be.equal(ethers.BigNumber.from(25));
  });

  it("Shouldn't change reward percentage, because it's not an admin", async function() {
    const [, addr1] = await ethers.getSigners();

    expect(stakingContract.connect(addr1).setRewardPersentage(ethers.BigNumber.from(25))).to.be.revertedWith("You are not owner");
  });

});
