const {ethers} = require("hardhat")
const {expect} = require("chai")
let tokens;

describe("Checking Token", ()=>{
    let token, deployer, accounts, receiver, tokens, exchange;
    beforeEach(async()=>{
        const Token = await ethers.getContractFactory("Token");
        tokens = (amountstr) =>{
            return ethers.utils.parseUnits(amountstr, 'ether')
        }

        token = await Token.deploy("Reza Token", "REZ", 1000000);
        await token.deployed();
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
        user = accounts[3]
    })

    describe("Deployment", ()=>{


        it("Token should have the correct name", async ()=>{
        expect(await token.name()).to.equal("Reza Token");
        });

        it("Token has the correct symbol", async()=>{
            expect(await token.symbol()).to.equal("REZ");
        });

        it("Token has 18 decimals", async()=>{
            expect(await token.decimals()).to.equal(18);
        })

        it("Total supply of the token", async()=>{
            expect(await token.totalSupply()).to.equal(tokens('1000000'));
        })

        it("assign the total balance to the deployer", async()=>{
            expect(await token.balanceOf(deployer.address)).to.equal(await token.totalSupply());
        })
    })

    
    describe("Transfers", ()=>{
        let transfer_tx;
        let amount;
        describe("Success group", ()=>{
            beforeEach(async()=>{
                // transfer
                amount = '100'
                transfer_tx = await token.connect(deployer).transfer(receiver.address, tokens(amount));
            })

            it("Simple transfer from deployer to Receiver", async()=>{
                expect(await token.balanceOf(deployer.address)).to.equal(tokens('999900'));
                expect(await token.balanceOf(receiver.address)).to.equal(tokens(amount));
            })

            it("Transfer event is emitted", async()=>{
                let result = transfer_tx.wait();//wait for the transaction to be included in the block and the events get emited
                let args = (await result).events[0].args;         
                expect(args[0]).to.equal(deployer.address)
                expect(args[1]).to.equal(receiver.address)
                expect(args[2]).to.equal(tokens(amount))
            })
        })

        describe("Failure group", ()=>{
            it ("rejects insufficient balances", async()=>{
                const invalid_amount = tokens('100000000')
                expect(token.connect(deployer).transfer(receiver.address, invalid_amount)).to.be.reverted
            })
        }) 

    })

    describe("Approve...", ()=>{
        let approve_tx, result, amount_transfer, amount_allowance, amount_transfer_from, amount_wrong_allowance;

        beforeEach(async()=>{
            amount_transfer = '1000'
            amount_transfer_from = '300'
            amount_allowance = '500'
            amount_wrong_allowance = '2000'
            transfer_tx = await token.connect(deployer).transfer(receiver.address, tokens(amount_transfer));
            transfer_tx.wait()

        })

        describe("Success...", async ()=>{
          
            it("Allowance changed after approval", async()=>{
                // before approval
                expect(await token.balanceOf(receiver.address)).to.equal(tokens(amount_transfer))
                expect(await token.balanceOf(exchange.address)).to.equal(tokens('0'));
                expect(await token.allowance(receiver.address, exchange.address)).to.equal(tokens('0'))
                // approve
                approve_tx = await token.connect(receiver).approve(exchange.address, tokens(amount_allowance));
                result = approve_tx.wait()
                // after approval
                expect(await token.balanceOf(receiver.address)).to.equal(tokens(amount_transfer))
                expect(await token.balanceOf(exchange.address)).to.equal(tokens('0'))
                expect(await token.allowance(receiver.address, exchange.address)).to.equal(tokens(amount_allowance))    
            });

            it ("Event emitted...", async()=>{
               // let event = await result.logs
                let approval_event = ((await result).events[0])
                expect(approval_event.event).to.equal("Approval");
                expect(approval_event.args[0]).to.equal(receiver.address)
                expect(approval_event.args[1]).to.equal(exchange.address)
                expect(approval_event.args[2]).to.equal(tokens(amount_allowance))   
            });
        })

        describe("Failure...", async()=>{
            it ("Not enough balance to allow", async()=>{
                expect(token.connect(receiver).approve(exchange.address, tokens(amount_wrong_allowance))).to.be.reverted; 
            })
        });


        describe("TransferFrom...", ()=>{
           
            beforeEach(async()=>{
                approve_tx = await token.connect(receiver).approve(exchange.address, tokens(amount_allowance));
                approve_tx.wait()
            })
            
            describe ("Success", ()=>{
                it("Transfer from reciver to exchange", async()=>{
                    let tx = await token.connect(exchange).transferFrom(receiver.address, user.address, tokens(amount_transfer_from))
                    result = tx.wait()
                    expect(await token.allowance(receiver.address, exchange.address)).to.equal(tokens(amount_allowance).sub(tokens(amount_transfer_from)))
                    expect(await token.balanceOf(user.address)).to.equal(tokens(amount_transfer_from))
                    expect(await token.balanceOf(receiver.address)).to.equal(tokens(amount_transfer).sub(tokens(amount_transfer_from)))
                })

                it ("The TransferFrom event is emitted", async()=>{
                    let tx = await token.connect(exchange).transferFrom(receiver.address, user.address, tokens(amount_transfer_from))
                    result = tx.wait()
                    args = (await result).events[0].args;
                    expect(args[0]).to.equal(receiver.address)
                    expect(args[1]).to.equal(user.address)
                    expect(args[2]).to.equal(tokens(amount_transfer_from))            
                })
            })
    
            describe ("Failure...", ()=>{    
                it("Transfer from reciver to exchange with not sufficient balance", async()=>{
                    expect(token.connect(exchange).transferFrom(receiver.address, user.address, tokens('2000'))).to.be.reverted
                })
    
                it("Transfer from reciver to exchange with not sufficient allowance", async()=>{
                    expect(token.connect(exchange).transferFrom(receiver.address, user.address, tokens('800'))).to.be.reverted
                })
            })
    
        })
    })


    

})