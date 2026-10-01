import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

/**
 * Mạng local dùng tài khoản mặc định của Hardhat.
 * Mạng testnet dùng PRIVATE_KEY trong blockchain/.env (xem .env.example).
 */
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];
const rpc = (envName: string, fallback: string) => process.env[envName] || fallback;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'cancun' },
  },
  networks: {
    // `npx hardhat node` – chainId 31337, RPC http://127.0.0.1:8545
    localhost: { url: 'http://127.0.0.1:8545', chainId: 31337 },

    // ---- Testnet EVM (cần ETH test từ faucet cho ví PRIVATE_KEY) ----
    sepolia: { url: rpc('SEPOLIA_RPC_URL', 'https://ethereum-sepolia-rpc.publicnode.com'), chainId: 11155111, accounts },
    baseSepolia: { url: rpc('BASE_SEPOLIA_RPC_URL', 'https://sepolia.base.org'), chainId: 84532, accounts },
    polygonAmoy: { url: rpc('POLYGON_AMOY_RPC_URL', 'https://rpc-amoy.polygon.technology'), chainId: 80002, accounts },
    arbitrumSepolia: { url: rpc('ARBITRUM_SEPOLIA_RPC_URL', 'https://sepolia-rollup.arbitrum.io/rpc'), chainId: 421614, accounts },
    optimismSepolia: { url: rpc('OP_SEPOLIA_RPC_URL', 'https://sepolia.optimism.io'), chainId: 11155420, accounts },
  },
};

export default config;
