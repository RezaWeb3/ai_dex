import config from "./../config.json"
import { useSelector, useDispatch } from 'react-redux';
import {loadTokens} from "./../store/interactions"

const Markets = () => {
    let chainId = useSelector(state=> state.provider.chainId)
    let token1_symbol = useSelector(state=> state.tokens.symbols[0])
    let token2_symbol = useSelector(state=> state.tokens.symbols[1])
    let connection = useSelector(state => state.provider.connection)
    let dispatch = useDispatch()

    console.log(`${token1_symbol}_${token2_symbol}`)

    // Because the value of each option in the drop down menu is a comma separated string of the token addresses, 
    // we will seperate them in order to know which pair of tokens is currently selected by the user 
    const handleMarketChangeSelection = async (e)=>{
        let twoTokens = e.target.value.split(",");
        let tokens = await loadTokens(connection, [twoTokens[1], twoTokens[0]], dispatch)
    }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>
        {chainId && config[chainId] ?
            (<select name="Markets" id="Markets" onChange={handleMarketChangeSelection}>
                <option value={`${config[chainId].METH},${config[chainId].MDAI}`}>mETH / mDAI </option>
                <option value={`${config[chainId].MSOL},${config[chainId].MDAI}`}>mSOL / mDAI </option>
            </select>)
            :
            (<div><p>Not Deployed To the Network</p></div>)
        }
        <hr />
      </div>
    )
  }
  
  export default Markets;