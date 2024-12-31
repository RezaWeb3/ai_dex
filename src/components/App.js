import { useEffect } from 'react';
import config from "../config.json"
import {loadProvider, loadNetwork, getChainid, loadAccount, loadTokens, loadExchange} from "../store/interactions"
import './../App.css';
import {useDispatch} from 'react-redux'
import Navbar from './Navbar'


 const App =  ()=> {
  const dispatch = useDispatch()
  
  const loadBlockchainData = async()=>{
    let connection = loadProvider(dispatch)

    // fetch the current account and balance from metamask
    let network = await loadNetwork(connection, dispatch)
    let chainId = await getChainid(network, dispatch)
   
    // reload when the active account on metamask changes
    const handleAccountsChanged = async ()=>{
      await loadAccount(connection, dispatch)
    }

    // reload when the network changes
     const handleNetworkChanged = async ()=>{
      network = await loadNetwork(connection, dispatch)
    } 

    window.ethereum.on('chainChanged', handleNetworkChanged)
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    

    if (!config[chainId]){
      console.log("Chain ID does not exist")
      //~ handle it better
    } 
    else
    {
      try
      {
        let exchange = await loadExchange(connection, config[chainId].EXCHANGE, dispatch)
        let tokens = await loadTokens(connection, [config[chainId].MDAI, config[chainId].METH], dispatch)
      }
      catch{}
    }
  }

  useEffect(()=>{
    loadBlockchainData()
  })
  return (
    <div>

      {/* Navbar */}
      <Navbar />
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>
          
          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;

