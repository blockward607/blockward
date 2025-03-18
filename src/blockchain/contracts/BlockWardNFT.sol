
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BlockWardNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from wallet address to bool indicating if address is a teacher
    mapping(address => bool) private _teachers;
    
    // Events
    event TeacherAdded(address indexed teacher);
    event TeacherRemoved(address indexed teacher);
    event BlockWardMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("BlockWard", "BW") {
        // Set contract deployer as initial teacher
        _teachers[msg.sender] = true;
    }

    // Add a new teacher
    function addTeacher(address teacher) public onlyOwner {
        _teachers[teacher] = true;
        emit TeacherAdded(teacher);
    }

    // Remove a teacher
    function removeTeacher(address teacher) public onlyOwner {
        _teachers[teacher] = false;
        emit TeacherRemoved(teacher);
    }

    // Check if an address is a teacher
    function isTeacher(address addr) public view returns (bool) {
        return _teachers[addr];
    }

    // Mint a new BlockWard NFT (only teachers can mint)
    function mintBlockWard(address to, string memory tokenURI) public returns (uint256) {
        require(_teachers[msg.sender], "BlockWardNFT: Only teachers can mint");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit BlockWardMinted(to, tokenId, tokenURI);
        
        return tokenId;
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
