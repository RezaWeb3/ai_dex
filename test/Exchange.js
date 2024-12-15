const {ethers} = require("hardhat")
const {expect} = require("chai")

let tokens;

describe ("Testing Exchange SC...", ()=>{
    let exchange, deployer, receiver, exchangeAccount, user, exchangeFeeRecipient;
    let feepercent;
    tokens = (amountStr)=>{
        return ethers.utils.parseUnits(amountStr, "ether");
    }
    
    describe ("Exchange deployment...", ()=>{
        beforeEach(async()=>{
            let accounts = await ethers.getSigners();
            deployer = accounts[0]
            receiver = accounts[1]
            exchangeAccount = accounts[2]
            user = accounts[3]
            exchangeFeeRecipient = accounts[4]
            feepercent = 10;
            let Exchange = await ethers.getContractFactory("Exchange");
            exchange = await Exchange.deploy(exchangeFeeRecipient.address, feepercent)
       })

       it("deployed successfully...", async ()=>{
            expect(await exchange.feeRecipient()).to.equal(exchangeFeeRecipient.address);
            expect(await exchange.feePercent()).to.equal(feepercent); 
       })
        
       
    })
})