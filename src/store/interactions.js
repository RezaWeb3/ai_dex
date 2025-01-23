// This file contains all helper functions that change the state in redux
// For example, transferring tokens from one account to exchange

import {ethers} from 'ethers'
import TOKEN_ABI from "./../abis/Token.json"
import EXCHANGE_ABI from "./../abis/Exchange.json"
import {stringToTokens} from './../components/helper'


/*
* SET UPs
*/

let exchange_initialized = false;

// get the web provider
export const loadProvider = (dispatch)=> {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type: 'PROVIDER_LOADED', connection})
    return connection
}

//get the entire network
export const loadNetwork = async (connection, dispatch) =>{
    connection = loadProvider(dispatch)
    const network = await connection.getNetwork();
    dispatch({type: 'NETWORK_LOADED', network})
    return network
}

// Gets the chain id from the network and saves it in the state
export const getChainid = async (network, dispatch) =>{
    const chainId = network.chainId;
    dispatch({type:'CHAIN_ID_LOADED', chainId})   
    return chainId
}

// subscribing to the events on exchange so that we can change the state on the app
export const subscribeToEvents = (exchange, dispatch)=>{
     exchange.on('Deposit', (_token, _sender, _amount, event)=>{
        if (!exchange_initialized)
        {
            console.log("No Action. Just initialize ")
        }
        else
        {
            dispatch({type:'TRANSFER SUCCESSFUL', event})
        }
        exchange_initialized = true
    })
}


/*
* Loading info from the accounts
 */

// Retrieves the account information and the balance from the wallet
// and store it in the state
export const loadAccount = async (provider, dispatch)=>{
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts' })
    let account = accounts[0];
    dispatch({type:'ACCOUNT_LOADED', account})
    account = ethers.utils.getAddress(accounts[0])
    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatEther(balance)
    dispatch({type:'ETHER_BALANCE_LOADED', balance})
    return account
}

// Gets the pair of the token contracts from the chain and saves it in the state
export const loadTokens = async(provider, addresses = [], dispatch)=> {
    let token, symbol;
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({type:'TOKEN_1_LOADED', token, symbol})
    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({type:'TOKEN_2_LOADED', token, symbol})
    return token;
}

//
// Loads the exchange contracts and saves it in the state
export const loadExchange = async(provider, exchangeAddress, dispatch) =>{
    let exchange;
    exchange = new ethers.Contract(exchangeAddress, EXCHANGE_ABI, provider);
    dispatch({type:'EXCHANGE_LOADED', exchange})
    
    return exchange;
}



/*
 Balances for account and the exchange 
*/

//
// Retrieves the deposit and wallet balances for the pair of tokens that the user selected in the market
// and saves it in the state
export const loadBalances = async (walletaddress, exchange, tokens, dispatch)=>{
    if (tokens && tokens.loaded){
        if (tokens.contracts[0])
        {         
            let walletbalance0 = ethers.utils.formatUnits(await tokens.contracts[0].balanceOf(walletaddress), 18)
            let exchangebalance0 = ethers.utils.formatUnits(await exchange.contract.balanceOf(await tokens.contracts[0].address, walletaddress), 18)
            dispatch({type:'TOKEN0_BALANCES_LOADED', walletbalance0, exchangebalance0})
        }

        if (tokens.contracts[1])
        {
            let walletbalance1 = ethers.utils.formatUnits(await tokens.contracts[1].balanceOf(walletaddress), 18)
            let exchangebalance1 = ethers.utils.formatUnits(await exchange.contract.balanceOf(await tokens.contracts[1].address, walletaddress), 18)
            dispatch({type:'TOKEN1_BALANCES_LOADED', walletbalance1, exchangebalance1})
        }
    }
    else
        console.log("NOT LOADED YET")
}




/*
    TOKEN TRANSFERS
*/

// TransferFrom & required approvals
export const transferTokens = async (amountToTransfer, token, walletaddress, exchangeContract, provider, transferType, dispatch)=>{
    
    dispatch ({type:"TRANSFER PENDING"})
    // approve by the token
    try
    {
        let signer = provider.getSigner()
        const tokenContract = new ethers.Contract(token.address, TOKEN_ABI, signer);
        const exchange = new ethers.Contract(exchangeContract.address, EXCHANGE_ABI, signer)
        
        // We check the allowance. Maybe we have enough. 
        // If not, increase it.
        let allowanceAmount = await tokenContract.allowance(walletaddress, exchangeContract.address)  
        const amountToTrasferParsed = stringToTokens(amountToTransfer)
        if (allowanceAmount.gte(amountToTrasferParsed))
            console.log("No need for approval")
        else
        {
            let tx = await tokenContract.connect(signer).approve(exchangeContract.address, amountToTrasferParsed)
            tx.wait()
            allowanceAmount = await tokenContract.allowance(walletaddress, exchangeContract.address)
        }

        // Transfer from the deposit to exchange by spender

        let tx = await exchange.connect(signer).deposit(token.address, amountToTrasferParsed);
        tx.wait();
    }
    catch (e) {
        console.error(e)
        dispatch({type:"TRANSFER FAILED"})
    }
    
}




