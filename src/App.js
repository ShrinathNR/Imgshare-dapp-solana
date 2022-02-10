import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '0xshrinath';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const TEST_IMGS = ["https://i.imgur.com/a7s4g5Bb.jpg", "https://i.imgur.com/ekICIh2b.jpg", "https://i.imgur.com/1Q6zOt3b.jpg"];
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
  //send the meme img
  const sendMemeInfo = async () =>{
    if(imgURL.length>0 && message.length>0){
      console.log("meme link : ", imgURL);
      console.log("description:", message);
    } else{
      console.log("Enter valid url and message.");
    }
  };

  //form and collection of memes
  const renderIfConnected = () => (
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
        {memeList.map(img => (
          <div className="img-item" key={img}>
            <img src={img} alt={img} />
          </div>
        ))}
      </div>
    </div>
  );

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
      
      // Call Solana program here.
  
      // Set state
      setMemeList(TEST_IMGS);
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
