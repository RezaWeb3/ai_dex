import { useEffect } from 'react';
import TOKEN_ABI from "./abis/Token.json"
import config from "./config.json"
import './App.css';
import {ethers} from "ethers";

function App() {
    
  const loadBlockchainData = async()=>{
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts' })
    console.log(accounts[0])

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork()
    const token = new ethers.Contract(config[network.chainId].MSOL, TOKEN_ABI, provider);
    
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

