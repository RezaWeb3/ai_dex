// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol"; // see values that comes into project for dev
import "./Token.sol";
contract Exchange{
    address public feeRecipient;
    uint256 public feePercent;
    mapping (address => mapping (address=>uint256)) public balanceOf;
    mapping (uint256 => _Order) public Orders;
    mapping(uint256=>bool) public cancelledOrders;
    mapping(uint256=>bool) public filledOrders;

    uint256 public orderCount;
    struct _Order{
        address tokenSell;
        address tokenBuy;
        uint256 tokenSellAmount;
        uint256 tokenBuyAmount;
        address user;
        uint256 id;
        uint256 timestamp;
    }
    
    event Deposit(address indexed  _token, address indexed _sender, uint256 _amount);
    event Withdraw(address indexed _token, address indexed _sender, uint256 _amount, uint256 _balance);
    event Order(_Order order);
    event Fill( 
        address tokenSell,
        address tokenBuy,
        uint256 tokenSellAmount,
        uint256 tokenBuyAmount,
        address user,
        uint256 id,
        uint256 timestamp);

    event Cancel(
         address tokenSell,
        address tokenBuy,
        uint256 tokenSellAmount,
        uint256 tokenBuyAmount,
        address user,
        uint256 id,
        uint256 timestamp
    );

    constructor(address _feerecipient, uint256 _feepercentage){
        feeRecipient = _feerecipient;
        feePercent = _feepercentage;
        orderCount = 0;
    }

    function deposit(address _token, uint256 _amount) public returns(bool){
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        balanceOf[_token][msg.sender] += _amount;
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

    function makeOrder(address _tokenSell, uint256 _tokenSellAmount, address _tokenBuy, uint256 _tokenBuyAmount) public returns (bool){
       require(_tokenSellAmount > 0, "Invalid value for Token Sell Amount");
       require(_tokenBuyAmount > 0, "Invalid value for Token Buy Amount");
       require(_tokenBuy != address(0), "Invaid address" );
       require(_tokenSell != address(0), "Invalid address");
       require (balanceOf[_tokenSell][msg.sender] >= _tokenSellAmount, "Does not have enough balance");
       
       Orders[orderCount] = _Order(
            _tokenSell,
            _tokenBuy,
            _tokenSellAmount,
            _tokenBuyAmount,
            msg.sender,
            orderCount,
            block.timestamp
        );

        
        emit Order(Orders[orderCount]);
        orderCount += 1;
        return true;
    }

    function cancelOrder(uint256 _id) public returns(bool)
    {
        require(Orders[_id].tokenSell != address(0), "Order does not exist");
        _Order storage _order = Orders[_id];
        require(_order.user == msg.sender, "No authority to cancel the order");
        
        cancelledOrders[_id] = true;       

        emit Cancel(
             _order.tokenSell,
            _order.tokenBuy,
            _order.tokenSellAmount,
            _order.tokenBuyAmount,
            _order.user,
            _order.id,
            _order.timestamp
        );

        return true;
    }

    function fillOrder(uint256 _id) public returns(bool){

        // not to be cancelled
        // not ur own order
        // the same tokens 
        // balance to pay fees
        
        
        _Order storage _order = Orders[_id];
        //deposit(order.tokenBuy, order.tokenBuyAmount);
        _trade(_order.id, _order.tokenSell, _order.tokenSellAmount, _order.tokenBuy, _order.tokenBuyAmount,  _order.user);
        
        filledOrders[_order.id] = true;
        emit Fill(
            _order.tokenSell,
            _order.tokenBuy,
            _order.tokenSellAmount,
            _order.tokenBuyAmount,
            _order.user,
            _order.id,
            _order.timestamp
        );

        return true;

    }

    function _trade(
        uint256 id,
        address tokenBuy,
        uint256 tokenBuyAmount,
        address tokenSell,
        uint256 tokenSellAmount,
        address counter_party) internal returns(bool){

        require(Orders[id].user != address(0), "Invaid order");
        require(cancelledOrders[id]==false, "Order is cancelled");
        require(filledOrders[id]==false, "Order is already filled.");
        require(tokenSellAmount > 0, "Invalid amount");
        require(tokenBuyAmount > 0, "Invalid amount");
        require(balanceOf[tokenSell][msg.sender] >=  (tokenSellAmount + (tokenSellAmount * feePercent / 100)), "Not enough balance [you]");
        require(balanceOf[tokenBuy][counter_party] >= tokenBuyAmount, "Not enough balance [counter-party]");
        require(counter_party != msg.sender, "Cannot fill your own order");

        //msg.sender is the buyer

        balanceOf[tokenBuy][msg.sender] += tokenBuyAmount;
        balanceOf[tokenSell][msg.sender] -= tokenSellAmount + (tokenSellAmount * feePercent / 100);
        
        balanceOf[tokenSell][counter_party] += tokenSellAmount;
        balanceOf[tokenBuy][counter_party] -= tokenBuyAmount;

        // fee
        balanceOf[tokenSell][feeRecipient] += (tokenSellAmount * feePercent / 100);

        

        return true;

    }
}