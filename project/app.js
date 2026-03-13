// =======================================
// CONFIG
// =======================================

const CONFIG = {

RPC: "http://127.0.0.1:8545",
CHAIN_ID: "0x7a69",

TOKEN: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
CROWDSALE: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
DAO: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

}


// =======================================
// GLOBAL STATE
// =======================================

let provider
let signer
let account

let token
let crowdsale
let dao

let hasTokens = false


// =======================================
// ABI
// =======================================

const TOKEN_ABI = [
"function balanceOf(address) view returns (uint256)"
]

const CROWDSALE_ABI = [
"function buyTokens() payable",
"function totalRaised() view returns (uint256)"
]

const DAO_ABI = [

"function createProject(string,string,address)",
"function vote(uint256)",
"function fundProject(uint256)",

"function projects(uint256) view returns(string,string,address,uint256,bool)",
"function fundings(uint256) view returns(uint256,uint256,uint256,address)",
"function fundingCount() view returns(uint256)",
"function hasVoted(address,uint256) view returns(bool)"

]


// =======================================
// INIT
// =======================================

async function init(){

if(!window.ethereum){

status("❌ MetaMask not installed")
return

}

if(typeof ethers === 'undefined'){

status("❌ Ethers library not loaded")
return

}

try{

provider = new ethers.providers.Web3Provider(window.ethereum)

}catch(e){

status("❌ Failed to initialize provider: "+e.message)
return

}

ethereum.on("accountsChanged",onAccountsChanged)
ethereum.on("chainChanged",onChainChanged)

const accounts = await ethereum.request({method:"eth_accounts"})
if(accounts.length > 0){
onAccountsChanged(accounts)
}

}


// =======================================
// CONNECT WALLET
// =======================================

async function connectWallet(){

try{

if(!provider){

status("❌ Provider not initialized")
return

}

status("Connecting wallet...")

const accounts = await ethereum.request({
method:"eth_requestAccounts"
})

account = accounts[0]

signer = await provider.getSigner()

await switchNetwork()

initContracts()

console.log("Wallet connected successfully")

}catch(err){

status("❌ "+err.message)

}

}


// =======================================
// NETWORK
// =======================================

async function switchNetwork(){

try{

await ethereum.request({

method:"wallet_switchEthereumChain",
params:[{chainId:CONFIG.CHAIN_ID}]

})

}catch{

await ethereum.request({

method:"wallet_addEthereumChain",

params:[{

chainId:CONFIG.CHAIN_ID,
chainName:"Hardhat Local",
rpcUrls:[CONFIG.RPC],

nativeCurrency:{
name:"ETH",
symbol:"ETH",
decimals:18
}

}]

})

}

}


// =======================================
// CONTRACT INIT
// =======================================

function initContracts(){

token = new ethers.Contract(CONFIG.TOKEN,TOKEN_ABI,signer)
crowdsale = new ethers.Contract(CONFIG.CROWDSALE,CROWDSALE_ABI,signer)
dao = new ethers.Contract(CONFIG.DAO,DAO_ABI,signer)

}


// =======================================
// LOAD USER DATA
// =======================================

async function loadUser(){

    if(!account){
        console.log("No account, skipping loadUser")
        return
    }

    console.log("Loading user with token address:", CONFIG.TOKEN)
    const eth = await provider.getBalance(account)
    const grant = await token.balanceOf(account)

    console.log("ETH balance:", eth.toString())
    console.log("GRANT balance:", grant.toString())

    hasTokens = grant > 0

    setText("wallet-address",short(account))
    setText("wallet-balance",format(eth)+" ETH")
    setText("grant-balance",format(grant)+" GRANT")

    await loadTotalRaised()
}


// =======================================
// LOAD PROJECT LIST
// =======================================

async function loadProjects(){

    try{

        const container = document.getElementById("projects-list")
        container.innerHTML=""
        let html = ""

        for(let i=0;i<50;i++){

            try{
                console.log("Loading project", i)
                const p = await dao.projects(i)
                const voted = account ? await dao.hasVoted(account, i) : false
                const canVote = hasTokens && !voted

html += `
<div class="card p-6 rounded-xl">

<h3 class="text-lg text-white font-bold">
${p[0]}
</h3>

<p class="text-white/70 text-sm">
${p[1]}
</p>

<p class="text-blue-400 mt-2">
Votes: ${ethers.utils.formatEther(p[3])}
</p>

<p class="text-green-400">
Funded: ${p[4]}
</p>

<div class="mt-3 flex gap-3">

<button onclick="vote(${i})"
class="btn ${canVote ? 'bg-blue-500' : 'bg-gray-500'} px-4 py-2 rounded text-white" ${canVote ? '' : 'disabled'}>

${voted ? 'Voted' : hasTokens ? 'Vote' : 'No Tokens'}

</button>

<button onclick="fund(${i})"
class="btn ${p[4] ? 'bg-gray-500' : 'bg-green-500'} px-4 py-2 rounded text-white" ${p[4] ? 'disabled' : ''}>

${p[4] ? 'Funded' : 'Fund'}

</button>

</div>

</div>
`

}catch(e){
console.log("Error loading project", i, e)
break
}

}

container.innerHTML = html

        // cũng tải danh sách các khoản cấp vốn
        loadFundings()

    }catch(err){

        console.log(err)

    }

}


// =======================================
// BUY TOKENS
// =======================================

async function buyTokens(){
    // after buying update totals

try{

status("Buying tokens...")

const tx = await crowdsale.buyTokens({

value: ethers.utils.parseEther("0.1")

})

await waitTx(tx)

status("✅ Buy success")

status("Updating UI...")

loadUser()
loadProjects()

status("✅ Updated")

}catch(err){

status("❌ "+err.message)

}

}


// =======================================
// CREATE PROJECT
// =======================================

async function createProject(){

    try{

        status("Creating project...")

            // prompt user for project details (simpler than adding form)
        const name = prompt("Project name:")
        const description = prompt("Project description:")
        const recipient = prompt("Recipient address:")
        if(!name || !description || !recipient){
            status("❌ Project creation cancelled")
            return
        }
        if(!ethers.utils.isAddress(recipient)){
            status("❌ Invalid recipient address")
            return
        }

        const tx = await dao.createProject(
            name,
            description,
            recipient
        )

await waitTx(tx)

status("✅ Project created")

status("Updating UI...")

loadUser()
loadProjects()

status("✅ Updated")
loadFundings()

}catch(err){

status("❌ "+err.message)

}

}


// =======================================
// VOTE PROJECT
// =======================================

async function vote(id){

try{

status("Voting...")

const tx = await dao.vote(id)

await waitTx(tx)

status("✅ Vote success")

status("Updating UI...")

loadUser()
loadProjects()

status("✅ Updated")

}catch(err){

status("❌ "+err.message)

}

}


// =======================================
// FUND PROJECT
// =======================================

async function fund(id){

    try{

        status("Funding project...")

        const tx = await dao.fundProject(id)

await waitTx(tx)

status("✅ Project funded")

status("Updating UI...")

loadUser()
loadProjects()

status("✅ Updated")

}catch(err){

status("❌ "+err.message)

}

}


// =======================================
// DISCONNECT
// =======================================

function disconnectWallet(){

account=null
signer=null

toggleButtons(false)

status("Wallet disconnected")

}


// =======================================
// EVENTS
// =======================================

async function onAccountsChanged(acc){

if(acc.length===0){

disconnectWallet()

}else{

account=acc[0]
signer = await provider.getSigner()
await switchNetwork()
await initContracts()
await loadUser()
await loadProjects()
toggleButtons(true)
status("✅ Wallet connected")

}

}

function onChainChanged(id){

if(id!==CONFIG.CHAIN_ID){

status("⚠ Switch to Hardhat network")

}

}


// =======================================
// EXTENDED LOADERS

async function loadTotalRaised(){
    try{
        const raised = await crowdsale.totalRaised()        console.log("Total raised:", raised.toString())        setText("total-raised",format(raised)+" ETH")
    }catch(e){console.log(e)}
}

async function loadFundings(){
    try{
        const container = document.getElementById("fundings-list")
        container.innerHTML = ""
        const count = await dao.fundingCount()
        console.log("Funding count:", count.toString())
        let html = ""
        for(let i=0;i<Number(count);i++){
            console.log("Loading funding", i)
            const f = await dao.fundings(i)
            html += `<div class="funding-record">Project ${f[0]} received ${format(f[1])} ETH at ${new Date(f[2]*1000).toLocaleString()} by ${short(f[3])}</div>`
        }
        container.innerHTML = html
    }catch(e){console.log(e)}
}

// =======================================
// UI HELPERS
// =======================================

function status(msg){

setText("status-message",msg)

}

function setText(id,val){

const el=document.getElementById(id)

if(el) el.textContent=val

}

function toggleButtons(connected){

const connectBtn = document.getElementById("connect-btn")
if(connectBtn) connectBtn.classList.toggle("hidden",connected)

const disconnectBtn = document.getElementById("disconnect-btn")
if(disconnectBtn) disconnectBtn.classList.toggle("hidden",!connected)

const actionButtons = document.getElementById("action-buttons")
if(actionButtons) actionButtons.classList.toggle("hidden",!connected)

}

function short(addr){

if(!addr) return "Not connected"
return addr.slice(0,6)+"..."+addr.slice(-4)

}

function format(val){

return Number(
ethers.utils.formatEther(val)
).toFixed(4)

}

async function waitTx(tx){

status("⏳ Waiting for confirmation...")

const receipt=await tx.wait()

if(receipt && receipt.hash){

status("Tx confirmed: "+receipt.hash.slice(0,10)+"...")

} else {

status("Tx confirmed (no hash)")

}

}


// =======================================
// START
// =======================================

init()