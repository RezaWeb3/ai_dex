import {ethers} from 'ethers'
import TOKEN_ABI from "./../abis/Token.json"
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
export const loadAccount = async (dispatch)=>{
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts' })
    dispatch({type:'ACCOUNT_LOADED', accounts})
    let account = ethers.utils.getAddress(accounts[0])
    return account
}

// get the token
export const loadToken = async(provider, address, dispatch)=> {
    const token = new ethers.Contract(address, TOKEN_ABI, provider)
    const symbol = await token.symbol()
    dispatch({type:'LOAD_TOKEN', token, symbol})

    return token;
}


