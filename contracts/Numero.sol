// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract Nemero is ERC721 {
    address private contractOwner;
    uint256 private totalSupply;
    Status private status;

    mapping(uint256 tokenId => string) private idToTokenUri;

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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory imageURI = idToTokenUri[tokenId];
        return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name": "',
                            name(),
                            '","description":"An NFT that can be collected and create next NFT.","image":"',
                            imageURI,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function checkStatus() public view returns (Status) {
        return status;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }
}
