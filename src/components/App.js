import { useEffect } from 'react';
import config from "../config.json"
import {loadProvider, getNetwork, getChainid, loadAccount, loadTokens, loadExchange} from "../store/interactions"
import './../App.css';
import {useDispatch} from 'react-redux'

 const App =  ()=> {
  const dispatch = useDispatch()
  const loadBlockchainData = async()=>{
    const connection = loadProvider(dispatch)
    // fetch the current account and balance from metamask
    const accounts = await loadAccount(connection, dispatch)
   
    const network = await getNetwork(connection, dispatch)
    const chainId = await getChainid(network, dispatch)
    await getChainid(network, dispatch)
    let tokens = await loadTokens(connection, [config[chainId].MDAI, config[chainId].METH], dispatch)
    let exchange = await loadExchange(connection, config[chainId].EXCHANGE, dispatch)
  }

  useEffect(()=>{
    loadBlockchainData()
  })
  return (
    <div>

      {/* Navbar */}

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

