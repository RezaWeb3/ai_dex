// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol"; // see values that comes into project for dev

contract Token{
    // state variable
    // adding public gives us a special function
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping (address=>uint256) public balanceOf;

    //function balanceOf(address _owner) public view returns (uint256 balance)

    constructor (string memory _name, string memory _symbol, uint256 _totalsupply){
        name = _name;  
        symbol = _symbol;
        decimals = 18;
        totalSupply = _totalsupply;
        balanceOf[msg.sender] = _totalsupply;
    }
}