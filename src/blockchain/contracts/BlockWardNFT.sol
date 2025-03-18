
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
    
    // Mapping from student address to their assigned teacher
    mapping(address => address) private _studentTeachers;
    
    // Events
    event TeacherAdded(address indexed teacher);
    event TeacherRemoved(address indexed teacher);
    event StudentAssigned(address indexed student, address indexed teacher);
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
    
    // Assign a student to a teacher
    function assignStudentToTeacher(address student, address teacher) public {
        require(_teachers[msg.sender] || msg.sender == owner(), "Only teachers or owner can assign students");
        require(_teachers[teacher], "Target must be a teacher");
        _studentTeachers[student] = teacher;
        emit StudentAssigned(student, teacher);
    }
    
    // Get the teacher of a student
    function getStudentTeacher(address student) public view returns (address) {
        return _studentTeachers[student];
    }

    // Override transferFrom to enforce restrictions
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(!_teachers[to], "Teachers cannot receive BlockWards");
        
        // If recipient is a student, ensure it's coming from their teacher
        if (_studentTeachers[to] != address(0)) {
            require(
                _studentTeachers[to] == from || from == owner(), 
                "Students can only receive BlockWards from their assigned teacher or the contract owner"
            );
        }
        
        super.transferFrom(from, to, tokenId);
    }
    
    // Override safeTransferFrom to enforce restrictions (first overload)
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        require(!_teachers[to], "Teachers cannot receive BlockWards");
        
        // If recipient is a student, ensure it's coming from their teacher
        if (_studentTeachers[to] != address(0)) {
            require(
                _studentTeachers[to] == from || from == owner(), 
                "Students can only receive BlockWards from their assigned teacher or the contract owner"
            );
        }
        
        super.safeTransferFrom(from, to, tokenId);
    }
    
    // Override safeTransferFrom to enforce restrictions (second overload)
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(!_teachers[to], "Teachers cannot receive BlockWards");
        
        // If recipient is a student, ensure it's coming from their teacher
        if (_studentTeachers[to] != address(0)) {
            require(
                _studentTeachers[to] == from || from == owner(), 
                "Students can only receive BlockWards from their assigned teacher or the contract owner"
            );
        }
        
        super.safeTransferFrom(from, to, tokenId, data);
    }

    // Mint a new BlockWard NFT (only teachers can mint)
    function mintBlockWard(address to, string memory tokenURI) public returns (uint256) {
        require(_teachers[msg.sender], "BlockWardNFT: Only teachers can mint");
        require(!_teachers[to], "Teachers cannot receive BlockWards");
        
        // If the recipient is a registered student, ensure they are assigned to this teacher
        if (_studentTeachers[to] != address(0)) {
            require(
                _studentTeachers[to] == msg.sender, 
                "You can only mint to your assigned students"
            );
        } else {
            // Auto-assign the student to this teacher if they aren't assigned yet
            _studentTeachers[to] = msg.sender;
            emit StudentAssigned(to, msg.sender);
        }
        
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
    
    // Prevent direct ETH transfers
    receive() external payable {
        revert("Direct ETH transfers are not allowed");
    }
    
    // Prevent fallback ETH transfers
    fallback() external payable {
        revert("Direct ETH transfers are not allowed");
    }
}
