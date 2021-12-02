import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import myEpicNFT from "./utils/MyEpicNFT.json"

// Constants
const TWITTER_HANDLE = 'sk1122_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const RARIBLE_LINK = 'https://rinkeby.rarible.com/token/';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xD365365FE04dDd82427A2710B57CD054c7Cd1CDb"

const App = () => {
  const [account, setAccount] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [totalNFT, setTotalNFT] = useState(0)

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={() => connectWallet()} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log("Install Metamask")
      return
    } else {
      console.log("Lemme implement auth")
      console.log(ethereum)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if(accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found Account, ", account)
      setAccount(account)
      setupEventListener()
    } else {
      console.log("Create a Ethereum Account")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
  
      if(!ethereum) {
        console.log("Install Metamask")
        return
      }
  
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      console.log("Connected, ", accounts[0])
      setAccount(accounts[0])
      setupEventListener()
    } catch (e) {
      console.log(e)
    }
  }

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("myEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`)
        });
        connectedContract.on("totalNftMinted", (from, totalNft) => {
          setTotalNFT(totalNft.toNumber())
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractNFT = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log("Install Metamask")
        return
      }

      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer)

      setIsMinting(true)
      console.log("Going to pop up wallet to pay gas fess")
      let nftTxn = await connectedContract.makeAnEpicNFT()
      console.log("Mining...")
      await nftTxn.wait()
      setIsMinting(false)
      
      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
    } catch (err) {
      setIsMinting(false)
      console.error(err)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p style={{ color: 'white' }}>
            {totalNFT} Minted
          </p>
          {account === "" && renderNotConnectedContainer()}
          {account !== "" && 
            (<button onClick={askContractNFT} className="cta-button connect-wallet-button">
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>)
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
