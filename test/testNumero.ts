import NumeroModule from "../ignition/modules/NumeroModules";
import { ignition, ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { assert } from "chai";
import { AbiCoder, encodeBase64 } from "ethers";

describe("Numero", () => {
  async function deployNumero() {
    const { numero } = await ignition.deploy(NumeroModule);
    return numero;
  }

  async function getContract() {
    const numeroContract = await loadFixture(deployNumero);
    return numeroContract;
  }

  describe("constructor", async () => {
    it("initializeProperly", async () => {
      const numero = await getContract();
      const deployer = (await ethers.getSigners())[0];
      const owner = await numero.getOwner();
      const totalSupply = await numero.getTotalSupply();
      const name = await numero.name();
      const symbol = await numero.symbol();
      const status = await numero.checkStatus();
      const tokenId1 = await numero.tokenURI(1);
      // console.log(`tokenId1:${tokenId1}`);
      const baseUri = "data:application/json;base64,";
      // const tokenIdStr =
      //   '{"name": "Numero","description":"An NFT that can be collected and create next NFT.","image":"1"}';
      // const abiEncode = new AbiCoder();
      // const strToBase64 = abiEncode.encode(["string"], [tokenIdStr]);
      //tokenIdBytes is abi.encodePacked variable
      const tokenIdBytes =
        "0x7b226e616d65223a20224e756d65726f222c226465736372697074696f6e223a22416e204e465420746861742063616e20626520636f6c6c656374656420616e6420637265617465206e657874204e46542e222c22696d616765223a2231227d";
      const strAfBase64 = encodeBase64(tokenIdBytes);
      const encodeStrAfBase64 = baseUri + strAfBase64;
      assert.equal(owner, deployer.address);
      assert.equal(totalSupply, 0);
      assert.equal(name, "Numero");
      assert.equal(symbol, "NMR");
      assert.equal(status, 0);
      assert.equal(tokenId1, encodeStrAfBase64);
    });
  });
});
