import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying AgentPump...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON");

  // Deploy AgentPump
  const AgentPump = await ethers.getContractFactory("AgentPump");
  const agentPump = await AgentPump.deploy();
  await agentPump.waitForDeployment();

  const address = await agentPump.getAddress();
  console.log("✅ AgentPump deployed to:", address);

  // Register AI Agents
  const agents = [
    { name: "Claude", avatar: "🧠", wallet: "0xcAddBB9c29882Db33607a9F667404e0F1e7fc803" },
    { name: "GPT-4", avatar: "🤖", wallet: "0x9343f26Bfd351c4595e6a4839F7F86f770c1860D" },
    { name: "Gemini", avatar: "💎", wallet: "0x98e4e8BBD04EA3c30015d100Caa7C55bAa4698Fd" },
    { name: "Llama", avatar: "🦙", wallet: "0x73f2a6043Db38195975C0f98120BEE1760a2Ba5C" },
    { name: "Mistral", avatar: "🌪️", wallet: "0xc59bD59d3fB6AEe0e08E4b7C440F5291C50F325c" },
    { name: "DeepSeek", avatar: "🔍", wallet: "0xF6Ee7FFef9B6001d5B4ABEdBE5D3366E929Dd5B0" },
    { name: "Qwen", avatar: "🐉", wallet: "0xbA3898E890733070fA7325f089fcACbdb6DbD1E1" },
    { name: "Grok", avatar: "👽", wallet: "0xdfb9d7AfEC2fE8d358B95c0a96b19A511Ef50d16" },
  ];

  console.log("\n📝 Registering agents...");
  
  for (const agent of agents) {
    try {
      const tx = await agentPump.registerAgent(agent.wallet, agent.name, agent.avatar);
      await tx.wait();
      console.log(`✅ ${agent.name} registered: ${agent.wallet}`);
    } catch (e: any) {
      console.log(`⚠️ ${agent.name}: ${e.message}`);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\nContract address:", address);
  console.log("\nAdd to .env:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
