// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { config } from "dotenv";
import { ethers } from "hardhat";

config({ path: "/" });

const stakingToken = process.env.STAKING_TOKEN_ADDRESS;
const rewardToken = process.env.REWARD_TOKEN_ADDRESS;
const rewardPercentage = process.env.REWARD_PERCENTAGE;
const rewardTime = process.env.REWARD_TIME;
const unstakeTime = process.env.UNSTAKE_TIME;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  if (!stakingToken || !rewardToken || !rewardPercentage || !rewardTime || !unstakeTime) {
    throw 'Create all necessary env variables!'
  }

  // We get the contract to deploy
  const stakingFactory = await ethers.getContractFactory("Staking");
  const contract = await stakingFactory.deploy(stakingToken, rewardToken, rewardPercentage, rewardTime, unstakeTime);

  await contract.deployed();

  console.log("Staking contract deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});