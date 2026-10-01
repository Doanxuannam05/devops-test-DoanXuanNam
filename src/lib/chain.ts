import { BrowserProvider, Contract, Interface, JsonRpcProvider, isError, type Eip1193Provider } from 'ethers';
import type { Address } from '@/types/photography';

/* ------------------------------------------------------------------ config */
// Được `blockchain/scripts/deploy.ts` ghi vào .env.local. Thiếu địa chỉ contract → web chạy chế độ demo.
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '') as Address;
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? 'http://127.0.0.1:8545';
export const DEPLOY_BLOCK = Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK ?? 0);
export const IS_ONCHAIN = /^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS);
/** Các mạng EVM đã cấu hình sẵn trong blockchain/hardhat.config.ts */
const KNOWN_CHAINS: Record<number, { name: string; explorer?: string }> = {
  31337: { name: 'Hardhat Local' },
  11155111: { name: 'Sepolia', explorer: 'https://sepolia.etherscan.io' },
  84532: { name: 'Base Sepolia', explorer: 'https://sepolia.basescan.org' },
  80002: { name: 'Polygon Amoy', explorer: 'https://amoy.polygonscan.com' },
  421614: { name: 'Arbitrum Sepolia', explorer: 'https://sepolia.arbiscan.io' },
  11155420: { name: 'OP Sepolia', explorer: 'https://sepolia-optimism.etherscan.io' },
};
export const CHAIN_NAME = KNOWN_CHAINS[CHAIN_ID]?.name ?? `Chain ${CHAIN_ID}`;
/** Link xem giao dịch trên block explorer (không có với Hardhat local) */
export const txUrl = (hash: string) => {
  const explorer = KNOWN_CHAINS[CHAIN_ID]?.explorer;
  return explorer ? `${explorer}/tx/${hash}` : null;
};
export const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

/** Human-readable ABI – phải khớp với blockchain/contracts/PhotoChain.sol */
export const PHOTOCHAIN_ABI = [
  'function totalMinted() view returns (uint256)',
  'function getToken(uint256 tokenId) view returns (address owner, address creator, uint256 price, uint96 royaltyBps, string uri)',
  'function priceOf(uint256 tokenId) view returns (uint256)',
  'function mint(string uri, uint96 royaltyBps, uint256 price) returns (uint256)',
  'function list(uint256 tokenId, uint256 price)',
  'function unlist(uint256 tokenId)',
  'function buy(uint256 tokenId) payable',
  'event Minted(uint256 indexed tokenId, address indexed creator, uint96 royaltyBps)',
  'event Listed(uint256 indexed tokenId, address indexed seller, uint256 price)',
  'event Unlisted(uint256 indexed tokenId)',
  'event Sold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price, uint256 royalty)',
  'error NotTokenOwner()',
  'error NotListed()',
  'error WrongPayment(uint256 expected, uint256 sent)',
  'error RoyaltyTooHigh()',
  'error InvalidPrice()',
  'error CannotBuyOwnToken()',
  'error PaymentFailed()',
] as const;

/* --------------------------------------------------------------- providers */
let readProvider: JsonRpcProvider | null = null;

/** Đọc dữ liệu trực tiếp từ node (không cần ví). */
export function getReadProvider() {
  readProvider ??= new JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
  return readProvider;
}

export const getReadContract = () => new Contract(CONTRACT_ADDRESS, PHOTOCHAIN_ABI, getReadProvider());

export function getInjectedProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
}

/** Chuyển MetaMask sang đúng mạng (tự thêm mạng nếu chưa có). */
export async function ensureChain(eth = getInjectedProvider()) {
  if (!eth) throw new Error('Không tìm thấy ví. Hãy cài MetaMask.');
  const current = String(await eth.request({ method: 'eth_chainId' })).toLowerCase();
  if (current === CHAIN_ID_HEX) return;
  try {
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID_HEX }] });
  } catch (err) {
    const code = (err as { code?: number; data?: { originalError?: { code?: number } } })?.code;
    const nested = (err as { data?: { originalError?: { code?: number } } })?.data?.originalError?.code;
    if (code !== 4902 && nested !== 4902) throw err;
    await eth.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: CHAIN_ID_HEX,
          chainName: CHAIN_NAME,
          rpcUrls: [RPC_URL],
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        },
      ],
    });
  }
}

/** Contract gắn với tài khoản MetaMask hiện tại – dùng để gửi giao dịch. */
export async function getWriteContract() {
  const eth = getInjectedProvider();
  if (!eth) throw new Error('Không tìm thấy ví. Hãy cài MetaMask.');
  await ensureChain(eth);
  const signer = await new BrowserProvider(eth).getSigner();
  return new Contract(CONTRACT_ADDRESS, PHOTOCHAIN_ABI, signer);
}

/* ---------------------------------------------------------------- metadata */
export interface TokenMetadata {
  name?: string;
  description?: string;
  image?: string;
  properties?: { category?: string; license?: string; exif?: unknown };
}

export function encodeMetadata(meta: TokenMetadata) {
  const bytes = new TextEncoder().encode(JSON.stringify(meta));
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return `data:application/json;base64,${btoa(binary)}`;
}

export const resolveIpfs = (uri?: string) =>
  uri?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : (uri ?? '');

export async function readMetadata(uri: string): Promise<TokenMetadata> {
  const b64Prefix = 'data:application/json;base64,';
  if (uri.startsWith(b64Prefix)) {
    const bytes = Uint8Array.from(atob(uri.slice(b64Prefix.length)), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  if (uri.startsWith('data:application/json,')) {
    return JSON.parse(decodeURIComponent(uri.slice('data:application/json,'.length)));
  }
  const res = await fetch(resolveIpfs(uri));
  if (!res.ok) throw new Error(`Metadata ${res.status}`);
  return res.json();
}

/* ------------------------------------------------------------------ errors */
const REVERT_MESSAGES: Record<string, string> = {
  NotTokenOwner: 'Bạn không phải chủ sở hữu tác phẩm này.',
  NotListed: 'Tác phẩm hiện không được rao bán (có thể vừa có người mua).',
  WrongPayment: 'Số ETH gửi không khớp với giá hiện tại. Hãy tải lại trang rồi thử lại.',
  RoyaltyTooHigh: 'Tiền bản quyền tối đa là 10%.',
  InvalidPrice: 'Giá phải lớn hơn 0.',
  CannotBuyOwnToken: 'Bạn không thể mua tác phẩm của chính mình.',
  PaymentFailed: 'Chuyển tiền cho người bán/tác giả thất bại.',
};

const photoChainInterface = new Interface(PHOTOCHAIN_ABI);

/** Tìm revert data (0x…) trong các kiểu lỗi khác nhau của ethers / MetaMask rồi giải mã custom error. */
function decodeRevertName(err: unknown): string | undefined {
  const e = err as {
    revert?: { name?: string } | null;
    data?: unknown;
    error?: { data?: unknown };
    info?: { error?: { data?: unknown } };
  };
  if (e?.revert?.name) return e.revert.name;
  const nested = (v: unknown) => (typeof v === 'object' && v ? (v as { data?: unknown }).data : undefined);
  const candidates = [e?.data, e?.error?.data, nested(e?.error?.data), e?.info?.error?.data, nested(e?.info?.error?.data)];
  for (const c of candidates) {
    if (typeof c === 'string' && /^0x[0-9a-fA-F]{8}/.test(c)) {
      try {
        const parsed = photoChainInterface.parseError(c);
        if (parsed) return parsed.name;
      } catch {
        /* không phải lỗi của contract này */
      }
    }
  }
  return undefined;
}

export const NODE_DOWN_MESSAGE = `Không kết nối được blockchain tại ${RPC_URL}. Hãy chạy "npx hardhat node" trong thư mục blockchain.`;

/** Đổi lỗi của ethers / MetaMask / contract thành câu tiếng Việt dễ hiểu. */
export function toFriendlyError(err: unknown): string {
  const e = err as { code?: string | number; shortMessage?: string; message?: string; revert?: { name?: string } | null; info?: { error?: { code?: number; message?: string } } };
  if (isError(err, 'ACTION_REJECTED') || e?.code === 4001 || e?.info?.error?.code === 4001) {
    return 'Bạn đã từ chối giao dịch trong MetaMask.';
  }
  const revertName = decodeRevertName(err);
  if (revertName && REVERT_MESSAGES[revertName]) return REVERT_MESSAGES[revertName];

  const text = `${e?.shortMessage ?? ''} ${e?.message ?? ''} ${e?.info?.error?.message ?? ''}`.toLowerCase();
  if (isError(err, 'INSUFFICIENT_FUNDS') || text.includes('insufficient funds')) {
    return 'Ví không đủ ETH để trả giá và phí gas.';
  }
  if (text.includes('nonce')) {
    return 'MetaMask bị lệch nonce (thường do khởi động lại Hardhat node). Vào MetaMask → Settings → Advanced → "Clear activity tab data", rồi thử lại.';
  }
  if (isError(err, 'NETWORK_ERROR') || text.includes('failed to fetch') || text.includes('econnrefused') || text.includes('could not coalesce')) {
    return NODE_DOWN_MESSAGE;
  }
  return e?.shortMessage ?? e?.message ?? 'Đã xảy ra lỗi không xác định.';
}
