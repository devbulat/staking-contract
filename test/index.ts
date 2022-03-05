import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory } from "ethers";

let stakingTokenFactory: ContractFactory, 
    stakingToken: Contract, 
    value: BigNumber,
    stakingFactory: ContractFactory,
    stakingContract: Contract,
    rewardTokenFactory: ContractFactory,
    rewardToken: Contract;

beforeEach(async () => {
  value = ethers.utils.parseUnits("2", "wei");
  stakingTokenFactory = await ethers.getContractFactory("DevbulatERC20");
  stakingToken = await stakingTokenFactory.deploy("DevbulatERC20", "ERC20", 10);
  rewardTokenFactory = await ethers.getContractFactory("RewardToken");
  rewardToken = await rewardTokenFactory.deploy("Reward", "REW", 10);

  await stakingToken.deployed();
  await rewardToken.deployed();

  stakingFactory = await ethers.getContractFactory('Staking');
  stakingContract = await stakingFactory.deploy(
    stakingToken.address, 
    rewardToken.address,
    20,
    1,
    1
  );

  await stakingContract.deployed();
});

describe("Staking",  function () {
  it("Should stake tokens", async function() {
    const [owner] = await ethers.getSigners();
    const amount = ethers.utils.parseUnits("1", "wei");
    await stakingToken.approve(stakingContract.address, amount)
    await stakingToken.connect(owner).mint(owner.address, value);
    await stakingContract.stake(amount);

    expect(await stakingContract.getBalance(owner.address)).to.be.equal(amount);
  });

  it("Should unstake tokens", async function() {
    const [owner] = await ethers.getSigners();
    const amount = ethers.utils.parseUnits("1", "wei");
    await stakingToken.approve(stakingContract.address, amount)
    await stakingToken.connect(owner).mint(owner.address, value);
    await stakingContract.stake(amount);

    expect(await stakingContract.getBalance(owner.address)).to.be.equal(amount);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await stakingContract.unstake();

    expect(await stakingToken.balanceOf(owner.address)).to.be.equal(value);
  });

  it("Shouldn't unstake tokens", async function() {
    const [owner] = await ethers.getSigners();
    const amount = ethers.utils.parseUnits("1", "wei");
    await stakingToken.approve(stakingContract.address, amount)
    await stakingToken.connect(owner).mint(owner.address, value);
    await stakingContract.stake(amount);

    expect(await stakingContract.getBalance(owner.address)).to.be.equal(amount);

    await stakingContract.unstake();

    expect(await stakingToken.balanceOf(owner.address)).to.be.equal(amount);
  });

});
