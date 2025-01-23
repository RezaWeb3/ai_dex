import {createStore, combineReducers, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import {provider, accounts, tokens, exchange, balances} from './reducers'

const reducer = combineReducers({
    provider,
    accounts,
    tokens,
    exchange,
    balances
})

const initialState = {}
const middleware = [thunk]
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store