import { CONFIG, provider, signer, account, token, crowdsale, dao, hasTokens } from './config.js';
import { loadProjects, loadTotalRaised } from './projects.js';
import { TOKEN_ABI, CROWDSALE_ABI, DAO_ABI } from './abi.js';
import { setText, short, format, status } from './utils.js';

async function init() {
  if (!window.ethereum) {
    status('❌ MetaMask not installed');
    return;
  }
  if (typeof ethers === 'undefined') {
    status('❌ Ethers library not loaded');
    return;
  }

  window.ethereum.on('accountsChanged', onAccountsChanged);
  window.ethereum.on('chainChanged', onChainChanged);

  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length > 0) {
    onAccountsChanged(accounts);
  }
}

async function connectWallet() {
  try {
    if (!provider) {
      status('❌ Provider not initialized');
      return;
    }
    status('Connecting wallet...');

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    account = accounts[0];
    signer = await provider.getSigner();

    await switchNetwork();
    initContracts();
    await loadUser();

    console.log('Wallet connected successfully');
  } catch (err) {
    status('❌ ' + err.message);
  }
}

async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CONFIG.CHAIN_ID }]
    });
  } catch {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: CONFIG.CHAIN_ID,
        chainName: 'Hardhat Local',
        rpcUrls: [CONFIG.RPC],
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        }
      }]
    });
  }
}

function initContracts() {
  token = new ethers.Contract(CONFIG.TOKEN, TOKEN_ABI, signer);
  crowdsale = new ethers.Contract(CONFIG.CROWDSALE, CROWDSALE_ABI, signer);
  dao = new ethers.Contract(CONFIG.DAO, DAO_ABI, signer);
}

async function loadUser() {
  if (!account) {
    console.log('No account, skipping loadUser');
    return;
  }
  console.log('Loading user with token address:', CONFIG.TOKEN);
  const eth = await provider.getBalance(account);
  const grant = await token.balanceOf(account);

  console.log('ETH balance:', eth.toString());
  console.log('GRANT balance:', grant.toString());

  hasTokens = grant > 0;

  setText('wallet-address', short(account));
  setText('wallet-balance', format(eth) + ' ETH');
  setText('grant-balance', format(grant) + ' GRANT');
}

function disconnectWallet() {
  account = null;
  signer = null;
  toggleButtons(false);
  status('Wallet disconnected');
}

async function onAccountsChanged(acc) {
  if (acc.length === 0) {
    disconnectWallet();
  } else {
    account = acc[0];
    signer = await provider.getSigner();
    await switchNetwork();
    initContracts();
    await loadUser();
    await loadProjects();
    loadTotalRaised();
    toggleButtons(true);
    status('✅ Wallet connected');
  }
}

function onChainChanged(id) {
  if (id !== CONFIG.CHAIN_ID) {
    status('⚠ Switch to Hardhat network');
  }
}

export { init, connectWallet, disconnectWallet, loadUser, initContracts, switchNetwork, onAccountsChanged, onChainChanged };

