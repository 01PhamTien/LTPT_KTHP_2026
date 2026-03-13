# Grant DAO Dapp 🚀

## 🎯 Tổng quan
Grant DAO là Dapp hoàn chỉnh với:
- **GrantToken (ERC20)**: Token governance
- **Crowdsale**: ICO bán token nhận ETH (1 ETH = 1000 GRANT)
- **MiniGrantDAO**: Voting mini-grants, treasury ETH → project thắng

## 📋 Yêu cầu
- Node.js 18+
- MetaMask (cho test wallet)

## 🚀 Hướng dẫn chạy local (5 phút)

### 1. Clone & Install
```bash
git clone <repo>
cd my-app2
npm ci
```

### 2. Compile Contracts
```bash
npx hardhat compile
```
✅ Output: "Compiled X Solidity files successfully"

### 3. Chạy Local Blockchain
```bash
npx hardhat node
```
✅ Terminal hiển thị 20 accounts + private keys + RPC `http://127.0.0.1:8545`

**Keep this terminal open!**

### 4. Deploy Contracts
New terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
✅ Output addresses:
```
Token: 0x5FbD...aa3
DAO: 0xe7f1...512  
Crowdsale: 0x9fE4...6e0
```

### 5. Chạy Frontend Dashboard
New terminal:
```bash
npx http-server project/ -p 8080
```
✅ Mở browser: **http://localhost:8080**

### 6. Test với MetaMask (Optional)
1. **Add Network:**
   - RPC: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: ETH

2. **Import Account 0:**
   - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Balance: 10000 ETH

3. Interact qua dashboard (sau khi add wallet connect).

## 🧪 Test Flow
1. **Buy Tokens:** Crowdsale → Nhận 1000 GRANT/ETH
2. **Create Project:** DAO → Thêm mini-grant proposal
3. **Vote:** Holder GRANT vote project
4. **Fund:** Admin fund ETH cho project thắng votes

## 📁 Cấu trúc project
```
├── contracts/
│   ├── GrantToken.sol      # ERC20 + mint controlled
│   ├── Crowdsale.sol       # ICO buyTokens()
│   └── MiniGrantDAO.sol    # Voting + fund
├── project/                 # Frontend dashboard
│   ├── index.html         # Tailwind UI đẹp
│   └── app.js             # RPC read data
├── scripts/deploy.js       # Deploy all
└── test/                   # Unit tests
```

## 🔧 Troubleshooting
- **Compile error:** `npm ci` → `npx hardhat clean` → `npx hardhat compile`
- **Node not found:** Check `npx hardhat node` accounts visible
- **Frontend no data:** RPC `http://127.0.0.1:8545` accessible?
- **Metamask tx fail:** Import correct private key, network 31337

## 📈 Next Steps (TODO.md)
- Wallet connect MetaMask
- Full tx UI (buy/vote/create)
- Testnet deploy
- Production frontend

## 🎉 Demo Live
Dashboard: **http://localhost:8080**  
Node logs: Private keys + contracts ready!

**Made with ❤️ by BLACKBOXAI**

