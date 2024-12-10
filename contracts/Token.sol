// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol"; // see values that comes into project for dev

contract Token{
    // state variable
    // adding public gives us a special function
    string public name;
    constructor (){
        name = "My Token";  
    }
}