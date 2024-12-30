import {ethers} from 'ethers'
import TOKEN_ABI from "./../abis/Token.json"
import EXCHANGE_ABI from "./../abis/Exchange.json"

// get the web provider
export const loadProvider = (dispatch)=> {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type: 'PROVIDER_LOADED', connection})

    return connection
}

//get the entire network
export const getNetwork = async (connection, dispatch) =>{
    const network = await connection.getNetwork();
    dispatch({type: 'NETWORK_LOADED', network})

    return network
}

// get the chain id from te network
export const getChainid = async (network, dispatch) =>{
    const chainId = network.chainId;
    dispatch({type:'CHAIN_ID_LOADED', chainId})
    
    return chainId
}

// get the accounts
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

// get the token pair
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

export const loadExchange = async(provider, exchangeAddress, dispatch) =>{
    let Exchange;
    Exchange = new ethers.Contract(exchangeAddress, EXCHANGE_ABI, provider);
    dispatch({type:'EXCHANGE_LOADED', Exchange})
}




