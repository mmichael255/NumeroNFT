// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract Numero is ERC721 {
    address private _contractOwner;
    uint256 private _totalSupply;
    Status private _status;

    mapping(uint256 tokenId => string) private idToTokenUri;

    enum Status {
        OriginNumberNotYetMinted,
        CreatingNumber,
        AllNumberExceptZeroCreated,
        ZeroCreated
    }

    modifier onlyContractOwner() {
        if (msg.sender != _contractOwner) {
            revert("Must be contract owner");
        }
        _;
    }

    modifier onlyAllowMintOriginNumber() {
        if (_status != Status.OriginNumberNotYetMinted) {
            revert("Origin number not yet minted");
        }
        _;
    }

    modifier onlyAllowCreatingNumber() {
        if (_status != Status.CreatingNumber) {
            revert("Haven't mint origin numbers or All numbers have been minted");
        }
        _;
    }

    constructor(string[] memory uris) ERC721("Numero", "NMR") {
        _contractOwner = msg.sender;
        for (uint256 i = 0; i < 10; i++) {
            idToTokenUri[i] = uris[i];
        }
    }

    function mintOriginNumber() public onlyContractOwner onlyAllowMintOriginNumber {
        _safeMint(msg.sender, 1);
        _safeMint(msg.sender, 2);
        _status = Status.CreatingNumber;
        _totalSupply = 2;
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
        _totalSupply++;
        if (_totalSupply == 9) {
            _status = Status.AllNumberExceptZeroCreated;
        }
    }

    function createZero() public {
        if (balanceOf(msg.sender) < 9) {
            revert("Must have all 9 tokens");
        }
        _status = Status.ZeroCreated;
        _safeMint(msg.sender, 0);
        _totalSupply++;
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

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function getOwner() external view returns (address) {
        return _contractOwner;
    }

    function getTotalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function checkStatus() public view returns (Status) {
        return _status;
    }
}
