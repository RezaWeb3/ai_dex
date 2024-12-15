// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol"; // see values that comes into project for dev
import "./Token.sol";
contract Exchange{
    address public feeRecipient;
    uint256 public feePercent;
    constructor(address _feerecipient, uint256 _feepercentage){
        feeRecipient = _feerecipient;
        feePercent = _feepercentage;
    }

    function deposit(address _token, uint256 _amount) public returns(bool){
        Token(_token).transferFrom(msg.sender, address(this), _amount);

        return true;
    }

}