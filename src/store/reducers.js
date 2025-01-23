// This file contains the reducers which they update the actual state in redux


// The state for he network and chain
export const provider = (state = {}, action) =>{
    switch(action.type){
        case 'PROVIDER_LOADED':
            // disptches 
            return {
                ...state, // copy the existing state and add the connection to it.
                connection: action.connection
            }
        case 'NETWORK_LOADED':
            return {
                ...state,
                network : action.network
            }
        case 'CHAIN_ID_LOADED':
            return {
                ...state,
                chainId : action.chainId
            }
        default:
            return state; 
    }
} 

// The state for the accounts
export const accounts = (state={}, action) =>{
    switch (action.type){
        case 'ACCOUNT_LOADED':
            return {
                ...state, 
                accounts : action.account
            }
        case 'ETHER_BALANCE_LOADED':
            return {
                ...state, 
                balance : action.balance
            }
        default:
            return state
    }
}

// The state for the current pair of tokens
const TOKENS_DEFAULT_STATE = {
    loaded:false, 
    contracts:[], 
    symbols:[]
}

export const tokens =  (state=TOKENS_DEFAULT_STATE, action) =>{
    switch(action.type){
        case 'TOKEN_1_LOADED':
            return{
                ...state,
                loaded : true,
                contracts :[action.token],
                symbols : [action.symbol]       
            }
        case 'TOKEN_2_LOADED':
            return{
                ...state,
                loaded : true,
                contracts :[...state.contracts, action.token],
                symbols : [...state.symbols, action.symbol]       
            }
          
        default:
            return state;
    }
}

// The state for the exchange
// the name of he const will be the state name
const DEFAULT_EXCHANGE_STATE = {
    loaded: false,
    name:'test',
    contract: {},
    transaction:{
        transactionType: '',
        isSuccessful: true,
        isPending: false
    },
    transactionInProgress: false,
    events: []
}
export const exchange = (state=DEFAULT_EXCHANGE_STATE, action)=>{
    
    switch(action.type){
        case "EXCHANGE_LOADED":
            console.log("Exchange being loaded");
            return {
                ...state,
                exchange_loaded: true, // Update loaded flag
                contract: action.exchange, // Set the contract
                transaction: { ...state.transaction }, // Preserve nested transaction state
                transactionInProgress: state.transactionInProgress, // Explicitly carry over value
                events: [...state.events], // Preserve events array
            };
        case "TRANSFER PENDING":
            return {
                ...state,
                transaction:{
                    transactionType : 'Transfer',
                    isSuccessful : false,
                    isPending: true
                },
                transactionInProgress: true
            }
        case "TRANSFER SUCCESSFUL":
            return {
                ...state, 
                transaction:{
                    transactionType: 'Transfer',
                    isSuccessful: true,
                    isPending: false,
                    name:'test2'
                },
                transactionInProgress: false,
                events: [action.event, ...state.events] // keeping the events that happen successfully
            }
        case "TRANSFER FAILED":
            return {
                ...state, 
                transaction:{
                    transactionType: 'Transfer',
                    isSuccessful: false,
                    isPending: false,
                    isError: true,
                    name: 'test3'
                },
                transactionInProgress: false,
                events:[...state.events]
            }
        default:
            return state;
    }
}



// The current balances for the pair of token for the exchange and wallet 
export const balances = (state={loaded:false}, action)=>{
    
    switch(action.type){
        case "TOKEN0_BALANCES_LOADED":
            return {
                ...state,
                loaded : true, 
                walletbalances:[action.walletbalance0],
                exchangebalances: [action.exchangebalance0]            
            }
        case "TOKEN1_BALANCES_LOADED":
            return {
                ...state,
                walletbalances:[...state.walletbalances, action.walletbalance1],
                exchangebalances: [...state.exchangebalances, action.exchangebalance1]               
            }
        default:
            return state;
    }
}
