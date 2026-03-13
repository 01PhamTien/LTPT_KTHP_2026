// Main entry point - imports all modules (side effects), initializes app
import { walletInit } from './wallet.js';
import { initUI } from './ui.js';
import { loadProjects, loadTotalRaised } from './projects.js';
import './abi.js';
import './utils.js';
import './wallet.js';
import './projects.js';
import './ui.js';

// DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Init wallet (sets provider, events)
  await walletInit();
  
  // Setup UI globals for onclick
  initUI();
  
  // Initial load (if connected)
  if (account) {
    await loadProjects();
    await loadTotalRaised();
  }
});

