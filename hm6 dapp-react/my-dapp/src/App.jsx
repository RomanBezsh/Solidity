import { useState, useEffect } from 'react'
import web3 from './lib/web3';
import counterContract from './lib/contracts/counter-contract';

function App() {
  const [account, setAccount] = useState('');
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState(0);

  const getCounter = async () => {
    const result = await counterContract.methods.get_counter().call();
    setCount(result);
  }
  const setCounter = async (e) => {
    e.preventDefault();
    await counterContract.methods.set_counter(inputValue).send({ from: account });
    getCounter();
  }

  const getNextValue = async () => {
    const next = await counterContract.methods.next().send({ from: account });
    getCounter();
  }
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
      catch (error) {
        console.error("Connection error: ", error);
        alert("Connect to wallet error. See console logs");
      }
    }
    else alert("Install web3 wallet");
  }

  useEffect(() => {
    const loadAccounts = async () => {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }
    loadAccounts();
    getCounter();
    const handleChangedAccount = (accounts) => {
      setAccount(accounts[0]);
    }
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleChangedAccount);
    }
    else {
      alert("Install web3 wallet");
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleChangedAccount);
      } else alert("Install web3 wallet");
    }
  }, [])

  return (
    <>
      <div>
        <h1>Account: {account}</h1>
        <h3>Stored counter: {count}</h3>
        <button onClick={connectWallet}>Connect</button>
        <form onSubmit={setCounter}>
          <input type="number" placeholder='Set new value' onChange={(e) => setInputValue(e.target.value)} />
          <button type="submit">Set count</button>
        </form>
        <button onClick={getNextValue}>Next value</button>
      </div>
    </>
  )
}

export default App
