require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MiniGrantICO", function () {
  let token, crowdsale, dao;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const GrantToken = await ethers.getContractFactory("GrantToken");
    token = await GrantToken.deploy();
    await token.deployed();

    const MiniGrantDAO = await ethers.getContractFactory("MiniGrantDAO");
    dao = await MiniGrantDAO.deploy(token.address);
    await dao.deployed();

    const Crowdsale = await ethers.getContractFactory("Crowdsale");
    crowdsale = await Crowdsale.deploy(token.address, dao.address);
    await crowdsale.deployed();

    // give crowdsale permission to mint
    await token.setCrowdsale(crowdsale.address);
  });

  it("should sell tokens and increase totalRaised", async function () {
    expect(await crowdsale.totalRaised()).to.equal(ethers.constants.Zero);

    // buy 1 ETH worth
    await crowdsale.connect(addr1).buyTokens({ value: ethers.utils.parseEther("1") });
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("1000"));
    expect(await crowdsale.totalRaised()).to.equal(ethers.utils.parseEther("1"));
  });

  it("should track funding history and emit events", async function () {
    // send 2 ETH into DAO directly (simulating crowdsale)
    await owner.sendTransaction({ to: dao.address, value: ethers.utils.parseEther("2") });

    // create project and fund
    await dao.createProject("A","desc", addr2.address);

    // call directly inside expect so matcher has access to provider
    // execute and inspect receipt for events
    const tx = await dao.fundProject(0);
    const receipt = await tx.wait();
    const pf = receipt.events.find(e => e.event === "ProjectFunded");
    expect(pf).to.not.be.undefined;
    expect(pf.args.projectId).to.equal(0);
    expect(pf.args.amount).to.equal(ethers.utils.parseEther("2"));
    const fl = receipt.events.find(e => e.event === "FundingLogged");
    expect(fl).to.not.be.undefined;

    const count = await dao.fundingCount();
    expect(count).to.equal(1);
    const f = await dao.fundings(0);
    expect(f[0]).to.equal(ethers.BigNumber.from(0));
    expect(f[1]).to.equal(ethers.utils.parseEther("2"));
    // compare addresses manually to avoid matcher plugin issues
    if (f[3].toString().toLowerCase() !== owner.address.toLowerCase()) {
        throw new Error("sender address mismatch");
    }
  });
});
