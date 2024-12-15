// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol"; // see values that comes into project for dev
import "./Token.sol";
contract Exchange{
    address public feeRecipient;
    uint256 public feePercent;
    mapping (address => mapping (address=>uint256)) public balanceOf;
    event Deposit(address _token, address _sender, uint256 _amount);
    event Withdraw(address _token, address _sender, uint256 _amount, uint256 _balance);

    constructor(address _feerecipient, uint256 _feepercentage){
        feeRecipient = _feerecipient;
        feePercent = _feepercentage;
    }

    function deposit(address _token, uint256 _amount) public returns(bool){
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        balanceOf[address(_token)][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount);

        return true;
    }

    function withdraw(address _token, uint256 _amount) public returns(bool){
        require(balanceOf[_token][msg.sender] >= _amount, "Not sufficient balance");   
        Token(_token).transfer(msg.sender, _amount);
        balanceOf[_token][msg.sender] -= _amount;   
        emit Withdraw(_token, msg.sender, _amount,  balanceOf[_token][msg.sender]);
        return true;     
    }
    
    

}