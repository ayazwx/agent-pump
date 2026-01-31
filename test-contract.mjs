import { createPublicClient, http, parseAbi } from 'viem';

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
};

const client = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

const ABI = parseAbi([
  'function tokenCount() view returns (uint256)',
  'function getToken(uint256 tokenId) view returns (string name, string symbol, string metadata, address creator, uint256 createdAt, uint256 totalSupply, uint256 reserveBalance, uint256 price, uint256 marketCap, bool graduated)',
]);

const CONTRACT = '0x057B6Bd0474BfFf57c3c6979b09c70F4932D36D4';

async function test() {
  console.log('Fetching token count...');
  const count = await client.readContract({
    address: CONTRACT,
    abi: ABI,
    functionName: 'tokenCount',
  });
  console.log('Token count:', Number(count));
  
  for (let i = 0; i < Number(count); i++) {
    const token = await client.readContract({
      address: CONTRACT,
      abi: ABI,
      functionName: 'getToken',
      args: [BigInt(i)],
    });
    console.log(`\nToken ${i}:`);
    console.log('  Name:', token[0]);
    console.log('  Symbol:', token[1]);
    console.log('  MarketCap:', token[8].toString());
    console.log('  Graduated:', token[9]);
  }
}

test().catch(console.error);
