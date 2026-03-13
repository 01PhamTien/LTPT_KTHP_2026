import { toggleButtons } from './utils.js';
import { connectWallet, disconnectWallet } from './wallet.js';
import { buyTokens, createProject } from './projects.js';
import { vote, fund } from './projects.js';  // for dynamic onclick

// Setup global functions for HTML onclick attributes
function setupGlobals() {
  window.connectWallet = connectWallet;
  window.disconnectWallet = disconnectWallet;
  window.buyTokens = buyTokens;
  window.createProject = createProject;
  // vote/fund called dynamically from projects HTML onclick="vote(id)"
}

function initUI() {
  setupGlobals();
  // Initial toggle
  toggleButtons(!!account);
}

export { initUI, setupGlobals };

