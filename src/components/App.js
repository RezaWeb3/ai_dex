import { useEffect } from 'react';
import config from "../config.json"
import {loadProvider, getNetwork, getChainid, loadAccount, loadToken} from "../store/interactions"
import './../App.css';
import {useDispatch} from 'react-redux'

 const App =  ()=> {
  const dispatch = useDispatch()
  const loadBlockchainData = async()=>{
    const accounts = await loadAccount(dispatch)
    const connection = loadProvider(dispatch)
    const network = await getNetwork(connection, dispatch)
    const chainId = await getChainid(network, dispatch)
    await getChainid(network, dispatch)
    let token = await loadToken(connection, config[chainId].MDAI, dispatch)
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

