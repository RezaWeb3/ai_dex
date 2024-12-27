const hre = require("hardhat");
const fs = require("fs")
const { random } = require("lodash");

const tokens = (amountStr)=>{
  return ethers.utils.parseUnits(amountStr, "ether");
}

function getRandomAmount(maxvalue, num_accounts) {
  const randomScaled = ethers.BigNumber.from(Math.floor(Math.random() * 1e1)) // Scale to 9 decimals
  const scaledBigNumber =  maxvalue.mul(ethers.BigNumber.from(randomScaled)).div(num_accounts).div(1e1);
  return scaledBigNumber
}


async function main() {
  // Fetch the deployed contracts
  const rawData = fs.readFileSync("./src/config.json", 'utf8');
  const config = JSON.parse(rawData);
  // check the chain to be the same as the network
  const provider = ethers.provider; // Default provider from Hardhat
  const chainid = (await provider.getNetwork()).chainId;
  console.log(config[chainid].MDAI)
  const MDAI = await ethers.getContractAt('Token', config[chainid].MDAI)
  const METH = await ethers.getContractAt('Token', config[chainid].METH)
  const MSOL = await ethers.getContractAt('Token', config[chainid].MSOL)
  const Exchange = await ethers.getContractAt('Exchange', config[chainid].exchange)
  

  
  console.log("Connected Network:");
  console.log("Name:", network.name);
  console.log("Chain ID:", network.chainId); 
 
  /*
  set up 
  */ 
  const all_accounts = await ethers.getSigners()
  const accountAddresses = all_accounts.map(account => account.address);
  //console.log("Accounts:", accountAddresses);
  const total_accounts = 3
  const total_assets = 3;
  let assets = [MDAI, METH, MSOL] //~ for improvement make this a variable

  const deployer = all_accounts[0]
  const accounts = all_accounts.slice(1, total_accounts + 1) 
  let asset_transfer_amounts = [] // row = user, col = asset
  for (let i = 0; i < total_accounts; i++){
    asset_transfer_amounts[i] = []
    for (let j = 0; j < total_assets; j++){
      asset_transfer_amounts[i][j] = getRandomAmount(await assets[j].totalSupply(), total_accounts)
    }
  }

  console.log(asset_transfer_amounts)
  /* 
  transfer to the accounts
  */
  console.log("Transfers...")
  for (let i = 0; i < total_accounts; i++) {
    console.log("User ", i + 1 )
    for (let j = 0; j < total_assets; j++){
      console.log(`Transfering ${asset_transfer_amounts[i][j].toString()} ${await assets[j].symbol()} from ${deployer.address} to ${accounts[i].address}`)
      assets[j].connect(deployer).transfer(accounts[i].address, asset_transfer_amounts[i][j].toString())     
    }
    console.log("----------------")
  }

  const accountPrintOut = async(num_accounts, num_assets) => {
    console.log("------ USER ACCOUNT BALANCES ----- ")
    for (let i = 0; i < total_accounts; i++){
      console.log("User ", i + 1 )
      for (let j = 0; j < total_assets; j++){
        console.log(`${await assets[j].symbol()} address is ${await assets[j].address} and balance is  ${await assets[j].balanceOf(all_accounts[i+1].address)}`);
      }
      console.log("----------------")
    } 
  }
  await accountPrintOut(total_accounts, total_assets)

  /* 
    Depoits into the exchange
  */
  const exchangePrintOut = async()=>{
    console.log("------ EXCHANGE DEPOSIT BALANCES ----- ")
    for (let i = 0; i < total_accounts; i++)
    {
      for (let j = 0; j < total_assets; j++){
        console.log("Deposit balances for exchange....")
        console.log(`${await assets[j].symbol()} : from ${accounts[i].address} : ${await Exchange.balanceOf(assets[j].address, accounts[i].address)}`);
      }
    }
  }
  console.log("Deposits into the exchange")
  let tx;
  let approvedAmount;
  for (let i = 0; i < total_accounts; i++){
    for (let j = 0; j < total_assets; j++){
      approvedAmount = getRandomAmount(await assets[j].balanceOf(accounts[i].address), 1);
      tx = await assets[j].connect(accounts[i]).approve(Exchange.address, approvedAmount)
      tx.wait()
      tx = await Exchange.connect(accounts[i]).deposit(assets[j].address, approvedAmount);
      tx.wait()
      console.log(`Deposit ${approvedAmount} ${await assets[j].symbol()} from ${accounts[i].address} to exchange`);
    }  
  }

  await exchangePrintOut();

/*
  Make orders
*/

const orderPrintOut = async()=>{
  console.log("------ Current Orders ----- ")
  for (let i = 0; i < await Exchange.orderCount(); i++)
  {
    console.log(`order ${i}: ${await Exchange.Orders(i)}` );
  }
}

console.log("Making Orders")
let approvedAmount2;
for (let i = 0; i < total_accounts; i++){
  for (let j = 0; j < total_assets; j++){
    for (let z = 0; z < total_assets; z++)
    {
      if (z==j)
        continue;

      approvedAmount = getRandomAmount(await assets[j].balanceOf(accounts[i].address), 10);
      approvedAmount2 = getRandomAmount(await assets[j].balanceOf(accounts[i].address), 10);
      if (approvedAmount == 0 || approvedAmount2 == 0)
        continue;
      try
      {
        tx = await Exchange.connect(accounts[i]).makeOrder(assets[j].address, approvedAmount, assets[z].address, approvedAmount2);
        tx.wait()
        console.log(`Making order from ${approvedAmount} ${await assets[j].symbol()} to ${approvedAmount2} ${await assets[z].symbol()} by ${accounts[i].address} to `);
      }
      catch{
        console.log("Invalid Order")
      }
    }
  }  
}

await orderPrintOut();

/* 
 Cancel Orders
*/

const cancelledOrdersPrintOut = async()=>{
  console.log("CANCELLED ORDERS----------")
  let order_count = await Exchange.orderCount()
  for (let i = 0; i < order_count; i++)
  {
    //console.log("print out...order " + i)
    if (await Exchange.cancelledOrders(i)){
      console.log(`Order ${i} is cancelled`)
    }
  }
}

let order_count = await Exchange.orderCount()
let cancel_order_num = Math.floor(order_count / 10) + 1

for (let i = 0; i < cancel_order_num; i++){
  let order_no = Math.floor(Math.random() * (order_count)) + 1
  let order = await Exchange.Orders(order_no);
  let user_addr = order.user;
 
  for (let j = 0; j < total_accounts; j++){
    if (accounts[j].address != user_addr)
    {
      continue;
    }
    else{
      try
      {
        let tx = await Exchange.connect(accounts[j]).cancelOrder(order_no);
        tx.wait()
        console.log(`Order ${order_no} by ${accounts[j].address} is cancelled.`)
      }
      catch (error)
      {
        console.log("Cancelling order failed because " + error.reason)
      }
    }
  }
  
}

await cancelledOrdersPrintOut();

/*
 Fill Orders
*/

const filledOrdersPrintOut = async()=>{
  console.log("FILLED ORDERS----------")
  let order_count = await Exchange.orderCount()
  for (let i = 0; i < order_count; i++)
  {
    //console.log("print out...order " + i)
    if (await Exchange.filledOrders(i)){
      console.log(`Order ${i} is filled`)
    }
  }
}

order_count = await Exchange.orderCount()
let max_filled_order_num = Math.floor(order_count / 10) + 2

let filled_order_count = 0
while( filled_order_count < max_filled_order_num){
  let order_no = Math.floor(Math.random() * (order_count)) + 1
 // let order_to_be_filled = await Exchange.Orders(order_no);
  let user_to_fill_order = accounts[Math.floor(Math.random() * (total_accounts))] 
  console.log(`User ${user_to_fill_order.address} is going to fill order ${order_no}`)
  
  try{
  
    tx = await Exchange.connect(user_to_fill_order).fillOrder(order_no);
    tx.wait()
    filled_order_count++;
  }
  catch(error){
    console.log("Filling order failed because " + error.reason)
  }

  
}

filledOrdersPrintOut();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



