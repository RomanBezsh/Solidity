// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

contract MediaStore {
    struct Media {
        address owner;
        string cid;
        string name;
        uint timestamp;
        bool isDeleted;
    }

    event MeadiaCreated(
        address indexed owner,
        string cid,
        string name,
        uint timestamp
    );

    event MediaDeleted(uint indexed index);

    Media[] arts;

    function new_art(string memory cid, string memory name) external {
        arts.push(Media(msg.sender, cid, name, block.timestamp, false));
        emit MeadiaCreated(msg.sender, cid, name, block.timestamp);
    }

    function delete_art(uint index) external {
        require(index < arts.length, "Invalid index");
        require(arts[index].owner == msg.sender, "Only owner can delete");
        arts[index].isDeleted = true;
        emit MediaDeleted(index);
    }

    function get_arts() external view returns (Media[] memory) {
        return arts;
    }

    function get_art(uint index) external view returns (Media memory) {
        return arts[index];
    }
}
