import axios from 'axios';
import { config } from 'dotenv';

config();

const addressesString = process.env.ADDRESSES;
let ADDRESSES;

try {
  ADDRESSES = JSON.parse(addressesString);
} catch (e) {
  console.error('Failed to parse ADDRESSES:', e);
  ADDRESSES = [];
}

const rewardCyclesString = process.env.REWARD_CYCLES;
let REWARD_CYCLES;

try {
  REWARD_CYCLES = JSON.parse(rewardCyclesString);
} catch (e) {
  console.error('Failed to parse REWARD_CYCLES:', e);
  REWARD_CYCLES = [];
}

const network = 
  process.env.NETWORK === "mainnet" ? 
    "mainnet" : 
    process.env.NETWORK === "testnet" ? 
      "testnet" : 
      process.env.NETWORK === "nakamoto-testnet" ? 
        "nakamoto.testnet" : 
        "mainnet"

const START = 666050 + (REWARD_CYCLES[0] * 2100);
const END = 666050 + (REWARD_CYCLES[REWARD_CYCLES.length - 1] * 2100) + 2000;

const LIMIT = 250;

async function fetchRewardSlots(address) {
  let offset = 0;
  let burnHeights = [];

  while (true) {
    const url = `https://api.${network}.hiro.so/extended/v1/burnchain/reward_slot_holders/${address}?limit=${LIMIT}&offset=${offset}`;
    const response = await axios.get(url);
    const results = response.data.results;

    if (results.length === 0) break;

    results.forEach(entry => {
      const burnBlockHeight = entry.burn_block_height;
      if (burnBlockHeight >= START && burnBlockHeight <= END) {
        burnHeights.push(burnBlockHeight);
      }
    });

    offset += LIMIT;
  }

  return burnHeights;
}

async function fetchRewards(address) {
  let offset = 0;
  let rewards = [];

  while (true) {
    const url = `https://api.${network}.hiro.so/extended/v1/burnchain/rewards/${address}?limit=${LIMIT}&offset=${offset}`;
    const response = await axios.get(url);
    const results = response.data.results;

    if (results.length === 0) break;

    results.forEach(entry => {
      const burnBlockHeight = entry.burn_block_height;
      const rewardAmount = parseInt(entry.reward_amount, 10);
      if (burnBlockHeight >= START && burnBlockHeight <= END) {
        rewards.push({ burnBlockHeight, rewardAmount });
      }
    });

    offset += LIMIT;
  }

  return rewards;
}

async function main() {
  for (const address of ADDRESSES) {
    let emptyRow = false;

    console.log(`Processing address: ${address}`);
    console.log();

    const rewardSlots = await fetchRewardSlots(address);
    const rewards = await fetchRewards(address);

    let totalRewards = 0;
    rewards.forEach(reward => {
      totalRewards += reward.rewardAmount;
    });

    const burnHeightsInRewards = new Set(rewards.map(r => r.burnBlockHeight));

    for (const burnBlockHeight of rewardSlots) {
      if (!burnHeightsInRewards.has(burnBlockHeight)) {
        try {
          const response = await axios.get(`https://api.${network}.hiro.so/extended/v2/burn-blocks/${burnBlockHeight}`);

          if (response.data.stacks_blocks) {
            console.log(`At block ${burnBlockHeight} there were no rewards received, but there was a stacks block anchored!`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`At block ${burnBlockHeight} there were no rewards received. No STX block anchored at this block.`);
          } else {
            console.log(`At block ${burnBlockHeight} there were no rewards received. Couldn't check for anchored STX blocks.`);
          }
        }

        emptyRow = true;
      }
    }

    if (emptyRow) {
      console.log()
    }

    console.log(`Total reward slots: ${rewardSlots.length}`);
    console.log(`Won reward slots: ${rewards.length}`);
    console.log(`Total rewards won: ${totalRewards / 100000000} BTC`);

    console.log()
  }
}

main().catch(console.error);
