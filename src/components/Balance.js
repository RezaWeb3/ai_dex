import logo from "./../assets/dapp.svg"
import {useSelector, useDispatch} from "react-redux";
import {loadWalletBalance, loadBalances, transferTokens, subscribeToEvents} from "./../store/interactions"
import { useEffect, useState } from "react";
import {formatLargeNumber} from './helper'

const Balance = () => {
    const symbols = useSelector(state=> state.tokens.symbols)
    const dispatch = useDispatch()
    let connection = useSelector(state => state.provider.connection)
    let walletAddress = useSelector(state=>state.accounts.accounts)
    let tokens = useSelector(state=>state.tokens)
    let exchange = useSelector(state=>state.exchange)
    let walletbalances = useSelector(state=>state.balances.walletbalances)
    let exchangebalances = useSelector(state=>state.balances.exchangebalances)
    let transactionInProgress = useSelector(state=>state.exchange.transactionInProgress)
    const [token0TransferAmount, setToken0TransferAmount] = useState(0)
    const [token1TransferAmount, setToken1TransferAmount] = useState(0)
    
    
    const resetDepositAmounts = ()=>{
        console.log("RESETTING TRANSFER AMOUNTS")
        setToken1TransferAmount(0)
        setToken0TransferAmount(0)
    }

    const loadTokenBalancesHandler = async()=>{
        if (walletAddress){
            loadBalances(walletAddress, exchange, tokens, dispatch)
        }
    }

    /// For handling the amount that is specified by the user to be transferred
    const amountTransferHandler = (e, token)=>{
        if (token && tokens && tokens.contracts && token.address == tokens.contracts[0].address)
        {
            setToken0TransferAmount(e.target.value)
        }
        if (token && tokens && tokens.contracts && token.address == tokens.contracts[1].address)
        {
            setToken1TransferAmount(e.target.value)
        }
    }

    //
    // Handles the deposits from the account that is connected to the exchange
    // e.preventDefault stops the page being reloaded when the button is pressed.
    // 1. Transfer
    // 2. Notify app that the Transfer is pending
    // 3. Wait for confirmation from blockchain - "subscribe to an event"
    // 4. Notify app that transaction is successful 
    // 5. Handle failures
    const depositHandler = async (e, tokenContract)=>{
        e.preventDefault() // prevent refreshing the page
        //  Transfer
        if (tokenContract && tokens && tokens.contracts && tokenContract.address == tokens.contracts[0].address && token0TransferAmount > 0)
        {
            console.log("Depositting Token 0 ", token0TransferAmount)
            await transferTokens(token0TransferAmount, tokenContract, walletAddress, exchange.contract, connection, 'Deposit', dispatch)
        }

        if (tokenContract && tokens && tokens.contracts && tokenContract.address == tokens.contracts[1].address && token1TransferAmount > 0)
        {
            console.log("Depositting Token 1 ", token1TransferAmount)
            await transferTokens(token1TransferAmount, tokenContract, walletAddress, exchange.contract, connection, 'Deposit', dispatch)
        }

        resetDepositAmounts()
    }
    
    // Run it initially and if there are any changes in the values below.
    // Basically, if the redux state changes and this should be updated.
    // Everytime the use interacts with this page, these values will be fetched from the
    // state and the loadTokenBalanceHandler runs if these values change.
    useEffect(()=>{
        loadTokenBalancesHandler()
        console.log("State value for token0 is ", token0TransferAmount)
        console.log("State value for token1 is ", token1TransferAmount)
    }, [walletAddress, tokens, exchange, token0TransferAmount, transactionInProgress, token1TransferAmount])

    return (
        <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
            <h2>Balance</h2>
            <div className='tabs'>
            <button className='tab tab--active'>Deposit</button>
            <button className='tab'>Withdraw</button>
            </div>
        </div>

        
        {symbols &&
       (<div className='exchange__transfers--form'>
            <div className='flex-between'>
                <p><small>Token</small><br/><img src={logo} alt="token0 logo" />{symbols[0]}</p>
                <p><small>Wallet</small><br/>{walletbalances && walletbalances[0] && formatLargeNumber(walletbalances[0])}</p>
                <p><small>Exchange</small><br/> {exchangebalances && exchangebalances[0] && formatLargeNumber(exchangebalances[0])}</p>
            </div>

            <form onSubmit={ (e)=> depositHandler(e, tokens.contracts[0])}>
                <label htmlFor="token0"></label>
                <input type="text" id='token0' placeholder='0.0000' onChange={(e)=>amountTransferHandler(e, tokens.contracts[0])} />

                <button className='button' type='submit'>
                    <span>Deposit</span>
                </button>
            </form>
        </div>)}

        <hr />

        <div className='exchange__transfers--form'>
            <div className='flex-between'>
                <p><small>Token</small><img src={logo} alt="Token1 logo"></img><br/>{symbols[1]}</p>
                <p><small>Wallet</small><br/>{walletbalances && walletbalances[1] && formatLargeNumber(walletbalances[1])}</p>
                <p><small>Exchange</small><br/>{exchangebalances && exchangebalances[1] && formatLargeNumber(exchangebalances[1])}</p>
            </div>
            <form onSubmit={(e)=>{depositHandler(e, tokens.contracts[1])}}>
            <label htmlFor="token1"></label>
            <input type="text" id='token1' value={token1TransferAmount > 0 ? token1TransferAmount : "0.000"} onChange={(e)=>amountTransferHandler(e, tokens.contracts[1])}/>

            <button className='button' type='submit'> 
                <span>Deposit</span>
            </button>
            </form>
        </div>

        <hr />
        </div>
    );
}
  
export default Balance;



