# PhotoChain – Smart contract (Hardhat)

Contract `PhotoChain.sol`: ERC-721 + ERC-2981 (royalty) + chợ mua bán (list / unlist / buy).

## Chạy local (2 terminal)

```powershell
cd blockchain
npm install            # lần đầu
npm test               # chạy 8 test của contract

# Terminal 1 – blockchain local (để chạy suốt, KHÔNG tắt)
npx hardhat node

# Terminal 2 – deploy + seed 43 tác phẩm mẫu + ghi ../.env.local
npm run deploy
```

Sau đó khởi động lại web (`npm run dev` ở thư mục gốc).

## MetaMask

- Mạng: RPC `http://127.0.0.1:8545`, Chain ID `31337`, ký hiệu `ETH`.
  (Web tự đề nghị thêm/chuyển mạng khi bạn giao dịch.)
- Tài khoản test: import private key từ output của `npx hardhat node`.
  Tài khoản #10 để trống cho bạn; #1–#7 là các tác giả mẫu, #8/#9/#11 là nhà sưu tầm mẫu.
- **Mỗi lần tắt/bật lại `npx hardhat node`** chuỗi bị reset →
  1. chạy lại `npm run deploy`, khởi động lại web;
  2. MetaMask → Settings → Advanced → **Clear activity tab data** (tránh lỗi nonce).

⚠️ Các private key của Hardhat là công khai – không bao giờ gửi tiền thật vào các địa chỉ này.

## Deploy lên testnet (Sepolia, Base Sepolia, Polygon Amoy, Arbitrum Sepolia, OP Sepolia)

1. Copy `.env.example` → `.env`, điền `PRIVATE_KEY` của **một ví test riêng**.
2. Lấy ETH test từ faucet của mạng tương ứng cho ví đó.
3. Chạy một trong các lệnh:
   ```powershell
   npm run deploy:sepolia
   npm run deploy:base-sepolia
   npm run deploy:polygon-amoy
   npm run deploy:arbitrum-sepolia
   npm run deploy:op-sepolia
   ```
4. Script tự ghi `../.env.local` (địa chỉ contract, chain ID, RPC). Khởi động lại `npm run dev`.

Trên testnet không seed dữ liệu mẫu (chỉ có 1 ví deploy) – chợ bắt đầu trống, tạo tác phẩm từ trang /create.
