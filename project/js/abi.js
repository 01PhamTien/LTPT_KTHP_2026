export const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)"
];

export const CROWDSALE_ABI = [
  "function buyTokens() payable",
  "function totalRaised() view returns (uint256)"
];

export const DAO_ABI = [
  "function createProject(string,string,address)",
  "function vote(uint256)",
  "function fundProject(uint256)",
  "function projects(uint256) view returns(string,string,address,uint256,bool)",
  "function fundings(uint256) view returns(uint256,uint256,uint256,address)",
  "function fundingCount() view returns(uint256)",
  "function hasVoted(address,uint256) view returns(bool)"
];

