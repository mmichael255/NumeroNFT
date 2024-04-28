import NumeroModule from "../ignition/modules/NumeroModules";
import { ignition, ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { assert, expect } from "chai";
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
      const tokenJsonBytes =
        "0x7b226e616d65223a20224e756d65726f222c226465736372697074696f6e223a22416e204e465420746861742063616e20626520636f6c6c656374656420616e6420637265617465206e657874204e46542e222c22696d616765223a2231227d";
      const strAfBase64 = encodeBase64(tokenJsonBytes);
      const encodeStrAfBase64 = baseUri + strAfBase64;
      assert.equal(owner, deployer.address);
      assert.equal(totalSupply, 0);
      assert.equal(name, "Numero");
      assert.equal(symbol, "NMR");
      assert.equal(status, 0);
      assert.equal(tokenId1, encodeStrAfBase64);
    });

    describe("mintNumber", async () => {
      it("mintSuccess", async () => {
        const numero = await getContract();
        const deployer = (await ethers.getSigners())[0];
        const ownerNumero = numero.connect(deployer);
        await ownerNumero.mintOriginNumber();
        const totalSupply = await numero.getTotalSupply();
        const balanceOfOwner = await numero.balanceOf(deployer);
        const ownerOfToken1 = await numero.ownerOf(1);
        const ownerOfToken2 = await numero.ownerOf(2);

        assert.equal(totalSupply, 2);
        assert.equal(balanceOfOwner, 2);
        assert.equal(ownerOfToken1, deployer.address);
        assert.equal(ownerOfToken2, deployer.address);
      });
      it("notOwnerMint", async () => {
        const numero = await getContract();
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await expect(notOwnerNumero.mintOriginNumber()).to.be.revertedWith(
          "Must be contract owner"
        );
      });
      it("notOwnerGetToken", async () => {
        const numero = await getContract();
        const owner = (await ethers.getSigners())[0];
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await numero.mintOriginNumber();
        await numero.approve(notOwner, 1);
        const tokenOwnerAddr = await numero.getApproved(1);
        assert.equal(tokenOwnerAddr, notOwner.address);
        await numero.approve(notOwner, 2);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 1);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 2);
        const balanceOfNotOwner = await numero.balanceOf(notOwner);
        const ownerOfToken1 = await numero.ownerOf(1);
        const ownerOfToken2 = await numero.ownerOf(2);
        assert.equal(balanceOfNotOwner, 2);
        assert.equal(ownerOfToken1, notOwner.address);
        assert.equal(ownerOfToken2, notOwner.address);
      });
      it("notOwnerCreateToken", async () => {
        const numero = await getContract();
        const owner = (await ethers.getSigners())[0];
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await numero.mintOriginNumber();
        await numero.approve(notOwner, 1);
        await numero.approve(notOwner, 2);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 1);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 2);
        await notOwnerNumero.createNumber(1, 2);
        const balanceOfNotOwner = await numero.balanceOf(notOwner);
        const ownerOfToken3 = await numero.ownerOf(3);
        assert.equal(ownerOfToken3, notOwner.address);
        assert.equal(balanceOfNotOwner, 3);
      });
      it("originNumNotYetMint", async () => {
        const numero = await getContract();
        await expect(numero.createNumber(1, 2)).to.be.revertedWith(
          "Haven't mint origin numbers or All numbers have been minted"
        );
      });
      it("createTokenIdMoreThan9", async () => {
        const numero = await getContract();
        const owner = (await ethers.getSigners())[0];
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await numero.mintOriginNumber();
        await numero.approve(notOwner, 1);
        await numero.approve(notOwner, 2);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 1);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 2);
        await notOwnerNumero.createNumber(1, 2);
        await notOwnerNumero.createNumber(2, 2);
        await notOwnerNumero.createNumber(2, 3);
        await expect(notOwnerNumero.createNumber(5, 5)).to.be.revertedWith(
          "Created number is greatet than 9 or already created"
        );
      });
      it("createTokenIdAlreadyCreated", async () => {
        const numero = await getContract();
        const owner = (await ethers.getSigners())[0];
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await numero.mintOriginNumber();
        await numero.approve(notOwner, 1);
        await numero.approve(notOwner, 2);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 1);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 2);
        await notOwnerNumero.createNumber(1, 2);
        await notOwnerNumero.createNumber(2, 2);
        await expect(notOwnerNumero.createNumber(1, 3)).to.be.revertedWith(
          "Created number is greatet than 9 or already created"
        );
      });
      it("createTokenIdUseNotOwnedId", async () => {
        const numero = await getContract();
        const owner = (await ethers.getSigners())[0];
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await numero.mintOriginNumber();
        await numero.approve(notOwner, 1);
        await numero.approve(notOwner, 2);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 1);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 2);
        await notOwnerNumero.createNumber(1, 2);
        await expect(notOwnerNumero.createNumber(1, 4)).to.be.revertedWith(
          "You need to own both tokens"
        );
      });
      it("createZero", async () => {
        const numero = await getContract();
        const owner = (await ethers.getSigners())[0];
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await numero.mintOriginNumber();
        await numero.approve(notOwner, 1);
        await numero.approve(notOwner, 2);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 1);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 2);
        await notOwnerNumero.createNumber(1, 2);
        await notOwnerNumero.createNumber(2, 2);
        await notOwnerNumero.createNumber(2, 3);
        await notOwnerNumero.createNumber(3, 3);
        await notOwnerNumero.createNumber(3, 4);
        await notOwnerNumero.createNumber(4, 4);
        await notOwnerNumero.createNumber(4, 5);
        await notOwnerNumero.createZero();

        const balanceOfNotOwner = await numero.balanceOf(notOwner);
        const ownerOfToken0 = await numero.ownerOf(0);

        assert.equal(ownerOfToken0, notOwner.address);
        assert.equal(balanceOfNotOwner, 10);
      });
      it("createZeroButDontHave9Tokens", async () => {
        const numero = await getContract();
        const owner = (await ethers.getSigners())[0];
        const notOwner = (await ethers.getSigners())[1];
        const notOwnerNumero = numero.connect(notOwner);
        await numero.mintOriginNumber();
        await numero.approve(notOwner, 1);
        await numero.approve(notOwner, 2);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 1);
        await notOwnerNumero.safeTransferFrom(owner, notOwner, 2);
        await notOwnerNumero.createNumber(1, 2);
        await notOwnerNumero.createNumber(2, 2);
        await notOwnerNumero.createNumber(2, 3);
        await notOwnerNumero.createNumber(3, 3);
        await notOwnerNumero.createNumber(3, 4);
        await notOwnerNumero.createNumber(4, 4);
        await expect(notOwnerNumero.createZero()).to.be.revertedWith(
          "Must have all 9 tokens"
        );
      });
    });
  });
});
