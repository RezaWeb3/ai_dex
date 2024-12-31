
import logo from './../assets/logo.png'
import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies'
import {loadAccount, loadNetwork, getChainid} from "../store/interactions"
import eth_logo from "./../assets/eth.svg"
import config from "../config.json"
import { useEffect } from 'react';
 
const Navbar = () => {
    let account = useSelector(state => state.accounts.accounts)
    let balance = useSelector(state => state.accounts.balance)
    let connection = useSelector(state => state.provider.connection)
    let chainId = useSelector(state=> state.provider.chainId)
    const dispatch = useDispatch()

    const walletConnectHandler = async()=>{
        const accounts = await loadAccount(connection, dispatch)
    }

    // Handles swiching chains
    // first change it on metamask and then load the network to update the state
    const networkChangeHandler = async (event)=>{     
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [ {chainId: event.target.value} ]
          }); 

        let network = await loadNetwork(connection, dispatch) 
        chainId = network.chainId
        console.log(`0x${chainId.toString(16)}`)
    }

    

   

    

    return(
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
            <img src={logo} className='logo' alt="AI DEX" />
            <h1> AI DEX </h1>
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={eth_logo} alt="eth logo"></img>

            {chainId && (
                <select 
                    key = {chainId}
                    name="networks"  
                    id="networks" 
                    value={config[chainId] ? `0x${chainId.toString(16)}` : '0'}
                    onChange={networkChangeHandler}>
                        <option value= "0" disabled  > Select Network</option>
                        <option value= "0x7A69"   > Localhost</option>
                        <option value= "0x4268"   > Holesky</option>
                        <option value= "0x2a"> Kovan</option>
                </select>)
            }

        </div>
  
        <div className='exchange__header--account flex'>
        { balance? (<p><small>{Number(balance).toFixed(4)} ETH</small></p>) : (<p><small>0 ETH</small></p>)}
        { account? (<a href="">{account.slice(0,5) + '...' + account.slice(38, 42)} 
            <Blockies 
                account={account} 
                seed={account}
                size={10} 
                scale={3} 
                color="#dfe" 
                bgColor="#ffe" 
                spotColor="#abc" 
                className="identicon"/> </a> )  
            : (<button onClick={walletConnectHandler} >Connect</button>)}
        </div>
      </div>
    )
  }
   
  export default Navbar;