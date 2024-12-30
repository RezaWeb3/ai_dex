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

export const tokens =  (state={loaded:false, contracts:[], symbols:[]}, action) =>{
    switch(action.type){
        case 'TOKEN_1_LOADED':
            return{
                ...state,
                loaded : true,
                contracts :[...state.contracts, action.token],
                symbols : [...state.symbols, action.symbol]       
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

export const exchange = (state={loaded:false, contract : {}}, action)=>{
    switch(action.type){
        case "EXCHANGE_LOADED":
            return {
                ...state,
                loaded:true,
                contract:action.Exchange
            }
        default:
            return state

    }
}