/**
 * Deploy PhotoChain + ghi địa chỉ contract vào ../.env.local cho Next.js.
 *
 *  - Local (npx hardhat node): seed toàn bộ tác phẩm mẫu kèm lịch sử mua bán thật on-chain.
 *      Terminal 1:  npx hardhat node
 *      Terminal 2:  npm run deploy
 *  - Testnet (Sepolia, Base Sepolia, Polygon Amoy…): chỉ deploy contract, marketplace bắt đầu trống.
 *      npm run deploy:base-sepolia   (cần PRIVATE_KEY trong blockchain/.env)
 */
import fs from 'node:fs';
import path from 'node:path';
import { ethers, network } from 'hardhat';
import { mockPhotography, mockSales } from '../../src/data/photography';

const toDataUri = (json: unknown) =>
  `data:application/json;base64,${Buffer.from(JSON.stringify(json), 'utf8').toString('base64')}`;

function writeEnv(values: Record<string, string>) {
  const envPath = path.resolve(__dirname, '../../.env.local');
  const lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8').split(/\r?\n/) : [];
  const kept = lines.filter((l) => l.trim() && !Object.keys(values).some((k) => l.startsWith(`${k}=`)));
  const next = [...kept, ...Object.entries(values).map(([k, v]) => `${k}=${v}`)].join('\n') + '\n';
  fs.writeFileSync(envPath, next);
  return envPath;
}

async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) throw new Error('Không có tài khoản deploy. Hãy đặt PRIVATE_KEY trong blockchain/.env');
  const isLocal = network.name === 'localhost' || network.name === 'hardhat';
  const rpcUrl = 'url' in network.config ? network.config.url : 'http://127.0.0.1:8545';
  const signerOf = (address: string) => {
    const s = signers.find((x) => x.address.toLowerCase() === address.toLowerCase());
    if (!s) throw new Error(`Không có tài khoản Hardhat cho ${address}`);
    return s;
  };

  // 1) Deploy
  const factory = await ethers.getContractFactory('PhotoChain');
  const contract = await factory.connect(signers[0]).deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const deployBlock = (await contract.deploymentTransaction()!.wait())!.blockNumber;
  console.log(`✔ PhotoChain deployed on ${network.name}: ${address} (block ${deployBlock})`);

  if (!isLocal) {
    const envPath = writeEnv({
      NEXT_PUBLIC_CONTRACT_ADDRESS: address,
      NEXT_PUBLIC_CHAIN_ID: String(network.config.chainId),
      NEXT_PUBLIC_RPC_URL: rpcUrl,
      NEXT_PUBLIC_DEPLOY_BLOCK: String(deployBlock),
    });
    console.log(`✔ Wrote ${envPath}`);
    console.log('→ Testnet: marketplace bắt đầu trống – hãy tạo tác phẩm từ trang /create.');
    return;
  }

  // 2) Mint các tác phẩm mẫu (tokenId 1..8 theo thứ tự)
  const tokenIdOf = new Map<string, bigint>();
  for (const p of mockPhotography) {
    const uri = toDataUri({
      name: p.title,
      description: p.description,
      image: p.image,
      attributes: [
        { trait_type: 'Category', value: p.category },
        { trait_type: 'License', value: p.license },
      ],
      properties: { category: p.category, license: p.license, exif: p.exif ?? null },
    });
    const creator = signerOf(p.creatorAddress);
    const tx = await contract.connect(creator).mint(uri, BigInt(Math.round(p.royalty * 100)), 0n);
    await tx.wait();
    const id = await contract.totalMinted();
    tokenIdOf.set(p.id, id);
    console.log(`  • #${id} ${p.title}`);
  }

  // 3) Phát lại lịch sử mua bán mẫu → royalty được trả thật on-chain
  for (const s of mockSales) {
    const id = tokenIdOf.get(s.photoId)!;
    const price = ethers.parseEther(s.price.toString());
    await (await contract.connect(signerOf(s.from)).list(id, price)).wait();
    await (await contract.connect(signerOf(s.to)).buy(id, { value: price })).wait();
  }
  console.log(`✔ Replayed ${mockSales.length} sales`);

  // 4) Rao bán theo trạng thái hiện tại
  for (const p of mockPhotography) {
    const id = tokenIdOf.get(p.id)!;
    const owner = await contract.ownerOf(id);
    if (owner.toLowerCase() !== p.ownerAddress.toLowerCase()) {
      throw new Error(`Owner mismatch for ${p.id}: ${owner} ≠ ${p.ownerAddress}`);
    }
    if (p.isListed) {
      await (await contract.connect(signerOf(owner)).list(id, ethers.parseEther(p.price.toString()))).wait();
    }
  }
  console.log('✔ Listings set');

  // 5) Cấu hình cho Next.js
  const envPath = writeEnv({
    NEXT_PUBLIC_CONTRACT_ADDRESS: address,
    NEXT_PUBLIC_CHAIN_ID: String(network.config.chainId ?? 31337),
    NEXT_PUBLIC_RPC_URL: rpcUrl,
    NEXT_PUBLIC_DEPLOY_BLOCK: String(deployBlock),
  });
  console.log(`✔ Wrote ${envPath}`);
  console.log('\n→ Khởi động lại `npm run dev` ở thư mục photochain để Next.js đọc .env.local mới.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
