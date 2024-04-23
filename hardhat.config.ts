import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.25",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      chainId: 31337,
    },
  },
};

export default config;
