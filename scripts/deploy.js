const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy GrantToken
  const GrantToken = await ethers.getContractFactory("GrantToken");
  const token = await GrantToken.deploy();
  await token.deployed();
  console.log("GrantToken deployed at:", token.address);

  // Deploy MiniGrantDAO
  const MiniGrantDAO = await ethers.getContractFactory("MiniGrantDAO");
  const dao = await MiniGrantDAO.deploy(token.address);
  await dao.deployed();
  console.log("MiniGrantDAO deployed at:", dao.address);

  // Deploy Crowdsale
  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(token.address, dao.address);
  await crowdsale.deployed();
  console.log("Crowdsale deployed at:", crowdsale.address);

  // Set quyền mint cho Crowdsale
  const tx = await token.setCrowdsale(crowdsale.address);
  await tx.wait();
  console.log("Crowdsale authorized to mint tokens!");

  console.log("\n=== Deployment Completed ===");
  console.log("Token Address:     ", token.address);
  console.log("DAO Address:       ", dao.address);
  console.log("Crowdsale Address: ", crowdsale.address);
}

// Run script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });