// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Nemero is ERC721 {
    address private contractOwner;
    uint256 private totalSupply;
    Status private status;

    enum Status {
        OriginNumberNotYetMinted,
        CreatingNumber,
        AllNumberExceptZeroCreated,
        ZeroCreated
    }

    modifier onlyContractOwner() {
        if (msg.sender != contractOwner) {
            revert("Must be contract owner");
        }
        _;
    }

    modifier onlyAllowMintOriginNumber() {
        if (status != Status.OriginNumberNotYetMinted) {
            revert("Origin number not yet minted");
        }
        _;
    }

    modifier onlyAllowCreatingNumber() {
        if (status != Status.CreatingNumber) {
            revert("Haven't mint origin numbers or All numbers have been minted");
        }
        _;
    }

    constructor() ERC721("Numero", "NMR") {}

    function mintOriginNumber() public onlyContractOwner onlyAllowMintOriginNumber {
        _safeMint(msg.sender, 1);
        _safeMint(msg.sender, 2);
        status = Status.CreatingNumber;
        totalSupply = 2;
    }

    function createNumber(uint256 sireId, uint256 matronId) public onlyAllowCreatingNumber {
        if (_ownerOf(sireId) != msg.sender || _ownerOf(matronId) != msg.sender) {
            revert("You need to own both tokens");
        }
        uint256 childId = sireId + matronId;
        if (childId > 9 || _ownerOf(childId) != address(0)) {
            revert("Created number is greatet than 9 or already created");
        }
        _safeMint(msg.sender, childId);
        totalSupply++;
        if (totalSupply == 9) {
            status = Status.AllNumberExceptZeroCreated;
        }
    }

    function createZero() public {
        if (balanceOf(msg.sender) < 9) {
            revert("Must have all 9 tokens");
        }
        status = Status.ZeroCreated;
        _safeMint(msg.sender, 0);
        totalSupply++;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {}

    function checkStatus() public view returns (Status) {
        return status;
    }
}
