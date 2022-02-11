import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from './idl.json';
import kp from './keypair.json'

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';


// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = '0xshrinath';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // const TEST_IMGS = ["https://i.imgur.com/a7s4g5Bb.jpg", "https://i.imgur.com/ekICIh2b.jpg", "https://i.imgur.com/1Q6zOt3b.jpg"];
  const [walletAddress, setWalletAddress] = useState(null);
  const [imgURL, setImgURL] = useState("");
  const [message, setMessage] = useState("");
  const [memeList, setMemeList] = useState([]);
  const checkIfWalletIsConnected = async () =>{
    try{
      const {solana} = window;

      if(solana){
        if(solana.isPhantom){
          console.log("phantom wallet is found!!!!");

          //connecting with the wallet
          const response = await solana.connect({onlyIfTrusted : true});
          console.log(`connected to this public key : ${response.publicKey.toString()}`); 
          setWalletAddress(response.publicKey.toString());
        }
      }else{
        alert('solana object not found... get the phantom wallet man!');
      }
    } catch(err){
      console.error(err);
    }
  };
  const connectWallet =  async() => {
    const {solana} = window;
    if (solana){
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };
  const renderIfNotConnectedWallet = () => (
    <button className='cta-button connect-wallet-button' onClick={connectWallet}>Connect to Wallet</button>
  );

  //defining inputs
  const onImgURLChange = (event) => {
    const { value } = event.target;
    setImgURL(value);
  };
  const onMessageChange = (event) => {
    const { value } = event.target;
    setMessage(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createImgAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getImageList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }
  //send the meme img
  const sendMemeInfo = async () =>{
    if(imgURL.length === 0 ){
      console.log("no meme link");
      return;
    }
    try{
      const provider= getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addImage(imgURL, message.length ? message : "",{
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      console.log("img url : ", imgURL);

      await getImageList();
    }catch(err){
      console.log(err);
    }
  };

  // get the imag list from the chain
  const getImageList = async () =>{
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("got the account", account);
      setMemeList(account.imgList);
      console.log(memeList);
    }catch(err){
      console.log(err);
      setMemeList(null);
    }
  }

  //form and collection of memes
  const renderIfConnected = () => {
    if (memeList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createImgAccount}>
            Do One-Time Initialization For Meme Program Account
          </button>
        </div>
      )
    } 
    else{
      return(
        <div className="connected-container">
          <form className='form' onSubmit = {(event)=>{
              event.preventDefault();
              sendMemeInfo();
            }}>
            <input type="text" placeholder='Enter the meme link dude...' value={imgURL} onChange={onImgURLChange}/>
            <input type="text" placeholder='Tell something about it!'value={message} onChange={onMessageChange}/>
            <button type='submit' className="cta-button submit-img-button">Share</button>
          </form>
          <div className="img-grid">
            {memeList.map((meme,id) => (
              <div className="img-item" key={id}>
                <img src={meme.imgLink} alt={meme.imgLink} />
                <p>{meme.msg}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
  };

  useEffect (() =>{
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load',onLoad);
    return () => window.removeEventListener('load',onLoad);
  },[]);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      
      console.log("fetching data from solana blockchain::");
      getImageList();
  
    }
  }, [walletAddress]);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 MemeShare</p>
          <p className="sub-text">
            View your memes collection in the metaverse ✨
          </p>
          {/* connect wallet*/}
          {!walletAddress && renderIfNotConnectedWallet()}
          {/* display images */}
          {walletAddress && renderIfConnected()}
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
