// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { deployContract } = require("@nomiclabs/hardhat-ethers/types");
const hre = require("hardhat");
const fs = require("fs")
const tokens = (amountStr)=>{
  return ethers.utils.parseUnits(amountStr, "ether");
}


async function deployContracts() {

  
  // check the chain to be the same as the network
  const provider = ethers.provider; // Default provider from Hardhat
  const network = await provider.getNetwork();

  console.log("Connected Network:");
  console.log("Name:", network.name);
  console.log("Chain ID:", network.chainId); 


  // Fetch the contract to deploy
  const Token = await ethers.getContractFactory("Token")
  const Exchange = await ethers.getContractFactory("Exchange")

  // accounts
  const accounts = await ethers.getSigners()
  const accountAddresses = accounts.map(account => account.address);
  console.log("Accounts:", accountAddresses);

  // deploy the contract
  const mDai = await Token.deploy("mDAI", "mDAI", tokens('10000'));
  await mDai.deployed()
  console.log(`The mDai address is : ${mDai.address}`)

  const mEth = await Token.deploy("mEth", "mEth", tokens('10000'));
  await mEth.deployed()
  console.log(`The mEth address is : ${mEth.address}`)

  const mSol = await Token.deploy("mSol", "mSol", tokens('10000'));
  await mSol.deployed()
  console.log(`The mSol address is : ${mSol.address}`)

  const exchange = await Exchange.deploy(accounts[0].address, 10)
  await exchange.deployed()
  console.log(`The exchange address is :" ${exchange.address}`)

  
  const configValues = {
    "31337": 
    {
      exchange: exchange.address,
      MDAI:mDai.address,
      METH:mEth.address,
      MSOL:mSol.address
    },
    
  };
  
  fs.writeFileSync('./src/config.json', JSON.stringify(configValues, null, 2), 'utf8');
  
  return {
    mDaiAddress : await mDai.address,
    mEthAddress : await mEth.address,
    mSolAddress : await mSol.address,
    exchangeAddress : await exchange.address
  };

}

module.exports = {deployContracts}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployContracts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
