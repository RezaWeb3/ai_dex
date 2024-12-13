const {ethers} = require("hardhat")
const {expect} = require("chai")
describe("Checking Token", ()=>{
    let token, deployer, accounts;
    
    beforeEach(async()=>{
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Reza Token", "REZ", ethers.utils.parseUnits('1000000', 'ether'));
        await token.deployed();
        accounts = await ethers.getSigners()
        deployer = accounts[0]
    })


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
        const value = ethers.utils.parseUnits('1000000', 'ether');
        expect(await token.totalSupply()).to.equal(value);
    })

    it("assign the total balance to the deployer", async()=>{
        expect(await token.balanceOf(deployer.address)).to.equal(await token.totalSupply());
    })
})