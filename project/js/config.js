// Config and global state
export const CONFIG = {
  RPC: "http://127.0.0.1:8545",
  CHAIN_ID: "0x7a69",
  TOKEN: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  CROWDSALE: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  DAO: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
};

// Globals
export let provider, signer, account, token, crowdsale, dao, hasTokens = false;

