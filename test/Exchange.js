const {ethers} = require("hardhat")
const {expect} = require("chai")


let tokens;

describe ("Testing Exchange SC...", ()=>{
    let exchange, token1, token2, deployer, receiver, exchangeAccount, user1, user2, exchangeFeeRecipient;
    let feepercent;
    tokens = (amountStr)=>{
        return ethers.utils.parseUnits(amountStr, "ether");
    }
    
    describe ("Exchange deployment...", ()=>{
        beforeEach(async()=>{

            let Exchange = await ethers.getContractFactory("Exchange");
            let Token = await ethers.getContractFactory("Token")

            let accounts = await ethers.getSigners();
            deployer = accounts[0]
            receiver = accounts[1]
            exchangeAccount = accounts[2]
            user1 = accounts[3]
            user2 = accounts[4]
            exchangeFeeRecipient = accounts[5]
            feepercent = 10;
            token1 = await Token.deploy("Reza Token", "REZ", tokens('1000000'))
            exchange = await Exchange.deploy(exchangeFeeRecipient.address, feepercent)
            await token1.connect(deployer).transfer(user1.address, tokens('3000'))
       
        })

       it("Fee Reipient match...", async ()=>{
            expect(await exchange.feeRecipient()).to.equal(exchangeFeeRecipient.address);
       })

       it("Fee Percentage match...", async ()=>{
        expect(await exchange.feePercent()).to.equal(feepercent); 
   })

       describe ("Depositing into an account", ()=>{
            let approve_amount_1 = tokens('2000')
            let tx;
            beforeEach(async()=>{
                await token1.connect(user1).approve(exchange.address, approve_amount_1);   
            })

            it("user1 desposit to the exchange...", async ()=>{
                expect(await token1.balanceOf(user1.address)).to.equal(tokens('3000'))
                expect(await token1.balanceOf(exchange.address)).to.equal(tokens('0'))
                expect(await token1.allowance(user1.address, exchange.address)).to.equal(approve_amount_1)
                tx = await exchange.connect(user1).deposit(token1.address, tokens('1000'));
                tx.wait()
                expect(await token1.balanceOf(user1.address)).to.equal(tokens('2000'))
                expect(await token1.balanceOf(exchange.address)).to.equal(tokens('1000'))
                expect(await token1.allowance(user1.address, exchange.address)).to.equal(tokens('1000'))
       
            })
       })  
       
    })
})