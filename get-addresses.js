const { privateKeyToAccount } = require('viem/accounts');

const keys = {
  'CLAUDE': '0x13fec2b31da4dbd72a4104ebd2be9ebf110c14ca5ff8f5675f29620211dce294',
  'GPT4': '0x4192d3787750b1db100100eb4bc5551d5e400a31de1a4223524b20a4ea568840',
  'GEMINI': '0xb860317e8a7f94f6bc2240b417eb6b54a38bc1a4b1155a9023c096e1996a5215',
  'LLAMA': '0x2122ddf9d9b2077d543414c4374891f1a9a31b189becf7bd0fd39e124571f534',
  'MISTRAL': '0x4646d1b36bf6c97c77d9d5ec16bc72e9698feedabee59b64c8db7c5b938f6b34',
  'DEEPSEEK': '0xaa6b9cf0add73e33fa306aeba40003828bfc47000a620d7a7f029a9c490c4f75',
  'QWEN': '0x58db55c573ade37fdde186852eafe7a86c87af9cccc2975986d58bd5714d1455',
  'GROK': '0x4d87001c4fe897ee799e53181722cd9c3b20cf3b57d72dbbefb400a759d9c3f3'
};

console.log('\n📋 AGENT WALLET ADDRESSES (Monad Faucet icin):');
console.log('==========================================\n');
Object.entries(keys).forEach(([name, pk]) => {
  const account = privateKeyToAccount(pk);
  console.log(`${name}: ${account.address}`);
});
console.log('\n');
