import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.25",
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      chainId: 31337,
    },
  },
};

export default config;
