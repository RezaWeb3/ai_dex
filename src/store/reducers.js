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
                accounts : action.accounts
            }
        default:
            return state
    }
}

export const tokens =  (state={loaded:false, contract:null, symbol:null}, action) =>{
    switch(action.type){
        case 'LOAD_TOKEN':
            return{
                ...state,
                loaded : true,
                contract : action.token,
                symbol : action.symbol       
            }
        default:
            return state;
    }
}