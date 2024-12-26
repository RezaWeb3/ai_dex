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
            token2 = await Token.deploy("God Token", "GOD", tokens('10000'))
            exchange = await Exchange.deploy(exchangeFeeRecipient.address, feepercent)
            let tx = await token1.connect(deployer).transfer(user1.address, tokens('3000'))
            tx.wait()
            tx = await token2.connect(deployer).transfer(user2.address, tokens('30'))
            tx.wait()
        })

       it("Fee Reipient match...", async ()=>{
            expect(await exchange.feeRecipient()).to.equal(exchangeFeeRecipient.address);
       })

       it("Fee Percentage match...", async ()=>{
        expect(await exchange.feePercent()).to.equal(feepercent); 
       })

       describe ("Deposits...", ()=>{
            let approve_amount_1 = tokens('2000')
            let approve_amount_2 = tokens('20')
            let tx;
            beforeEach(async()=>{
                await token1.connect(user1).approve(exchange.address, approve_amount_1);   
                await token2.connect(user2).approve(exchange.address, approve_amount_2);   
   
            })
            
            describe("Success...", ()=>
            {
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

                it("Deposit event emitted", async ()=>{

                    tx = await exchange.connect(user1).deposit(token1.address, tokens('1000'));
                    
                    let result = (await tx.wait()).events[1].args
                    expect(result._token).to.equal(token1.address);
                    expect(result._sender).to.equal(user1.address)
                    expect(result._amount).to.equal(tokens('1000'))
                    
                })

                it("Checking balances...", async()=>{
                    expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens('0'))
                    expect(await token1.balanceOf(user1.address)).to.equal(tokens('3000'))
                    tx = await exchange.connect(user1).deposit(token1.address, tokens('1000'))
                    await tx.wait()
                    expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens('1000'))
                    expect(await token1.balanceOf(user1.address)).to.equal(tokens('2000'))
                    
                })
            })

            describe ("Failure....", ()=>{
                it("user1 deposit to the exchange more than allowance...", async ()=>{
                    await expect( exchange.connect(user1).deposit(token1.address, tokens('3000'))).to.be.reverted;
                })
            })
       })  

        describe ("Withdrawals...", ()=>{
            let approve_amount_1 = tokens('2000')
            let tx;
            beforeEach(async()=>{
                await token1.connect(user1).approve(exchange.address, approve_amount_1);  
                await exchange.connect(user1).deposit(token1.address, approve_amount_1); 
            })
            describe("Success...", ()=>{
                it("Use withdraws from exchange...", async()=>{
                    expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(approve_amount_1);
                    expect(await token1.balanceOf(user1.address)).to.equal(tokens('1000'))
                    await exchange.connect(user1).withdraw(token1.address, approve_amount_1)
                    expect(await token1.balanceOf(user1.address)).to.equal(tokens('3000'))
                    expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens('0'));     
                })

                it("Emitting Withdrawal Event...", async()=>{
                    tx = await exchange.connect(user1).withdraw(token1.address, approve_amount_1)
                    let result = (await tx.wait()).events[1].args
                    expect(result._token).to.equal(token1.address)
                    expect(result._amount).to.equal(approve_amount_1)
                    expect(result._sender).to.equal(user1.address)  
                    expect(result._balance).to.equal(tokens('0'))             
                })

            })

            describe ("Failure...", ()=>{
                it("Use withdraws from exchange...", async()=>{
                    await expect(exchange.connect(user1).withdraw(token1.address, tokens('10000'))).to.be.reverted;
                })    
            })
            
       })

       describe ("Making orders...", ()=>{
        beforeEach(async()=>{
            let tx1 = await token1.connect(user1).approve(exchange.address, tokens('2000'));
            tx1.wait()
            let tx2 = await exchange.connect(user1).deposit(token1.address, tokens('1000'))
            tx2.wait()
            
            tx1 = await token2.connect(user2).approve(exchange.address, tokens('20'));
            tx1.wait()
            tx3 = await exchange.connect(user2).deposit(token2.address, tokens('20'))
            tx3.wait()
            
        })

        describe("Success...", ()=>{
            it("Placing order....", async()=>{
                
                let tx3 = await exchange.connect(user1).makeOrder(token1.address, tokens('1000'), token2.address, tokens('10'));
                tx3.wait();
                expect((await exchange.Orders(0)).tokenSell).to.equal(token1.address)
                expect((await exchange.Orders(0)).tokenBuy).to.equal(token2.address)
                expect((await exchange.Orders(0)).tokenSellAmount).to.equal(tokens('1000'))
                expect((await exchange.Orders(0)).tokenBuyAmount).to.equal(tokens('10'))
                expect((await exchange.Orders(0)).user).to.equal(user1.address)
                
                
                let tx4 = await exchange.connect(user2).makeOrder(token2.address, tokens('10'), token1.address, tokens('5000'));
                tx4.wait();
                expect((await exchange.Orders(1)).tokenSell).to.equal(token2.address)
                expect((await exchange.Orders(1)).tokenBuy).to.equal(token1.address)
                expect((await exchange.Orders(1)).tokenSellAmount).to.equal(tokens('10'))
                expect((await exchange.Orders(1)).tokenBuyAmount).to.equal(tokens('5000'))
                expect((await exchange.Orders(1)).user).to.equal(user2.address)
            })
        })

        describe("Failure...", ()=>{
             it("Placing order....", async()=>{
                await expect(exchange.connect(user1).makeOrder(token1.address, tokens('4000'), token2.address, tokens('10'))).to.be.reverted
                
            }) 
        })

       })

       describe("Cancelling / making orders...", ()=>{

            beforeEach(async()=>{
                // create orders
                let tx = await token1.connect(user1).approve(exchange.address, tokens('2000'))
                tx.wait()
                tx = await token2.connect(user2).approve(exchange.address, tokens('50'))
                tx.wait()
                tx = await exchange.connect(user1).deposit(token1.address, tokens('1500') )
                tx.wait()
                tx = await exchange.connect(user2).deposit(token2.address, tokens('30'))
                tx.wait()
                tx = await exchange.connect(user1).makeOrder(token1.address, tokens('1000'), token2.address, tokens('10'));
                tx.wait()
               // tx = await exchange.connect(user2).makeOrder(token2.address, tokens('10'), token1.address, tokens('2000'));
               // tx.wait()
                
            })
            describe ("Cancelling orders...", ()=>{
            
                describe("Success...", async()=>{
                    it("canceled...", async ()=>{
                        let tx =  await exchange.connect(user1).cancelOrder(0)
                        tx.wait();
                        expect(await exchange.cancelledOrders(0)).to.equal(true)
                    })

                    it("not canceled...", async ()=>{
                        let tx =  await exchange.connect(user1).cancelOrder(0)
                        tx.wait();
                        expect(await exchange.cancelledOrders(1)).to.not.equal(true)
                    })

                    
                })

                describe("Failure...", async()=>{
                    it("Not owner cancelling...", async()=>{
                        await expect( exchange.connect(user2).cancelOrder(0)).to.be.reverted
                    })

                    it("event emitted...", async ()=>{
                        await expect(exchange.connect(user1).cancelOrder(7)).to.be.reverted
                    })
                })
            })

            describe ("Filling orders...", ()=>{
            
                describe("Success...", async()=>{
                    it("change in balances", async()=>{
                        let balance_token1_user1_before = await exchange.balanceOf(token1.address, user1.address) 
                        let balance_token1_user2_before = await exchange.balanceOf(token1.address, user2.address) 
                        let balance_token2_user1_before = await exchange.balanceOf(token2.address, user1.address) 
                        let balance_token2_user2_before = await exchange.balanceOf(token2.address, user2.address) 
                        let balance_token1_exchange_before = await exchange.balanceOf(token1.address, await exchange.feeRecipient()) 
                        let balance_token2_exchange_before = await exchange.balanceOf(token2.address, await exchange.feeRecipient()) 
                       
                        let order = await exchange.Orders(0);
                        
                        let tx = await exchange.connect(user2).fillOrder(0);
                        tx.wait();
                        let balance_token1_user1_after = await exchange.balanceOf(token1.address, user1.address) 
                        let balance_token1_user2_after = await exchange.balanceOf(token1.address, user2.address) 
                        let balance_token2_user1_after = await exchange.balanceOf(token2.address, user1.address) 
                        let balance_token2_user2_after = await exchange.balanceOf(token2.address, user2.address) 
                        let balance_token2_exchange_after = await exchange.balanceOf(token2.address, await exchange.feeRecipient()) 
                        let balance_token1_exchange_after = await exchange.balanceOf(token1.address, await exchange.feeRecipient()) 
                  
                        expect(balance_token1_user1_after).to.equal(balance_token1_user1_before.sub(order.tokenSellAmount));
                        expect(balance_token1_user2_after).to.equal(balance_token1_user2_before.add(order.tokenSellAmount));
                        expect(balance_token1_exchange_after).to.equal(balance_token1_exchange_before);
                        expect(balance_token2_user1_after).to.equal(balance_token2_user1_before.add(order.tokenBuyAmount));
                        expect(balance_token2_exchange_after).to.greaterThan(balance_token2_exchange_before);      
                    });   

                })

                describe("Failure...", async()=>{
                    it("Order not exists", async()=>{
                       await  expect(exchange.connect(user2).fillOrder(3)).to.be.reverted
                    })


                    it("Order is cancelled", async()=>{
                        let tx = await exchange.connect(user1).cancelOrder(0)
                        tx.wait()
                        await expect(exchange.connect(user2).fillOrder(0)).to.be.reverted
                    })

                    it("Not sufficient funds", async()=>{
                        let tx = await exchange.connect(user2).withdraw(token2.address, tokens('20'))
                        tx.wait()
                        await expect(exchange.connect(user2).fillOrder(0)).to.be.reverted
                    })

                    it("Not sufficient counter party funds", async()=>{
                        let tx = await exchange.connect(user1).withdraw(token1.address, tokens('1000'))
                        tx.wait()
                        await expect( exchange.connect(user2).fillOrder(0)).to.be.reverted
                    })

                    it("Order already filled....", async()=>{
                        let tx = await exchange.connect(user2).fillOrder(0);
                        tx.wait()
                        await expect(exchange.connect(user2).fillOrder(0)).to.be.reverted;
                    })

                    it("Filling your own order....", async()=>{
                        await expect(exchange.connect(user1).fillOrder(0)).to.be.reverted;
                    })

                    it("Invalid order....", async()=>{
                        await expect(exchange.connect(user1).fillOrder(10)).to.be.reverted;
                    })
                    
                    
                })
            })
            
       })
       
    })
})