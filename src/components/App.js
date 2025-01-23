import { useEffect } from 'react';
import config from "../config.json"
import {loadProvider, loadNetwork, getChainid, loadAccount, loadTokens, loadExchange,  subscribeToEvents} from "../store/interactions"
import './../App.css';
import {useDispatch} from 'react-redux'
import Navbar from './Navbar'
import Markets from './Markets'
import Balance from './Balance'


 const App =  ()=> {
  const dispatch = useDispatch()
  
  //
  // Load the basic information from the chain and the wallet
  const loadBlockchainData = async()=>{
    let exchange, tokens;
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

    // Subscribe to the events that the wallet emits
    window.ethereum.on('chainChanged', handleNetworkChanged)
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    
    if (!config[chainId]){
      console.log("Chain ID does not exist")
      //~ handle it better
    } 
    else
    {
      // If the chain is part fo the existing configuration, loead the exchange and tokens
      try
      {
        
        exchange = await loadExchange(connection, config[chainId].EXCHANGE, dispatch)
        tokens = await loadTokens(connection, [config[chainId].MDAI, config[chainId].METH], dispatch)
        // listen to events
        subscribeToEvents(exchange, dispatch) // subscribe to the events in the exchange
      }
      catch(e){
        console.error(e)
      }
    }
  }

  // Run it iniaitlly
  useEffect(()=>{
    loadBlockchainData()
  },[])

  return (
    <div>

      {/* Navbar */}
      <Navbar />
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>
          <Markets />
          <Balance />
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

