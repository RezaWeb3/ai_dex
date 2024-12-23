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
    mapping (address=>mapping(address=>uint256)) public allowance;
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    
    constructor (string memory _name, string memory _symbol, uint256 _totalsupply){
        name = _name;  
        symbol = _symbol;
        decimals = 18;
        totalSupply = _totalsupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        return _transfer(msg.sender, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(allowance[_from][msg.sender] >= _value, "Allowance not sufficient");
        allowance[_from][msg.sender] -= _value;
        
        return _transfer(_from, _to, _value);
    }

    function _transfer (address _from, address _to, uint256 _value) internal returns (bool success){
        require(balanceOf[_from] >= _value, "Not sufficient balance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        
        return true;
    }
}