# PoX Reward Tracker

This package allows you to check PoX rewards received to a given list of addresses, in the given cycle span on the given network.
For each address, it will print the following information:
- `Processing address: <address>` - This is the address that is being analyzed currently.
- `At block <block> there were no rewards received. No STX block anchored at this block.` - There was no anchored stacks block in this bitcoin block, but it contained at least a reward slot for the processed address, meaning no rewards were received for the reserved slots at this block. This message will only be seen sometimes.
- `Total reward slots: <number of slots>` - The number of total reward slots allocated for the given cycles.
- `Won reward slots: <number of slots>` - The number of reward slots won in the given cycles.
- `Total rewards won: <amount> BTC` - The total amount rewarded in the given cycles, in BTC.

## Setup

This setup assumes a `Linux`/`MacOS` machine is being used, with the prequisites installed (`git`, `node`).

```bash
$ git clone https://github.com/BowTiedDevOps/pox-reward-tracker
$ cd pox-reward-tracker
$ npm i
```

## Configuring and running the application

This repository contains a sample configuration file (`.env.sample`):

```bash
# Reward cycles to fetch rewards for, as ["start", "end"], or ["cycle"].
# Limitations:
#   - start <= end;
REWARD_CYCLES=["84", "85"]

# List of addresses to fetch rewards for, as ["address", "address", ...].
ADDRESSES=["34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo"]

# Network to fetch rewards for.
# Possible options:
#   - "mainnet";
#   - "testnet";
#   - "nakamoto-testnet";
# Defaults to "mainnet" if ommitted or given a wrong value.
NETWORK="mainnet"
```

Adjust the `REWARD_CYCLES`, `ADDRESSES` and `NETWORK` variables as needed, then rename the file to `.env` and run the application:

```bash
$ mv .env.sample .env
$ npm run start # or `node index.js`
```

---

**Note:** Due to limitations in the Stacks API it uses, this application might become rate-limited at some point if doing mass requests.
