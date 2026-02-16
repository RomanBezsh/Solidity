// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 < 0.9.0;

import "hardhat/console.sol";

contract Forum {
    event PostCreated(address author, uint timestamp);
    event PostDeleted(uint index, address author);
    event PostsCleared(address owner, uint postsLength);
    event PostLiked(uint index, address user, bool isLiked); 

    struct Post {
        string message;
        address author;
        uint timestamp;
        uint likeCount;
        mapping(address => bool) usersWhoLiked; 
    }

    struct PostView {
        string message;
        address author;
        uint timestamp;
        uint likeCount;
        bool iLiked; 
    }

    Post[] private posts;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier OnlyOwner() {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    function create_post(string memory message) public returns(bool) {
        Post storage newPost = posts.push();
        newPost.message = message;
        newPost.author = msg.sender;
        newPost.timestamp = block.timestamp;
        newPost.likeCount = 0;

        emit PostCreated(msg.sender, block.timestamp);
        return true;
    }

    function toggle_like(uint index) public {
        require(index < posts.length, "Index out of bounds");
        Post storage post = posts[index];

        if (post.usersWhoLiked[msg.sender]) {
            post.likeCount -= 1;
            post.usersWhoLiked[msg.sender] = false;
            emit PostLiked(index, msg.sender, false);
        } else {
            post.likeCount += 1;
            post.usersWhoLiked[msg.sender] = true;
            emit PostLiked(index, msg.sender, true);
        }
    }

    function get_posts(address user) public view returns(PostView[] memory) {
        PostView[] memory allPosts = new PostView[](posts.length);
        for (uint i = 0; i < posts.length; i++) {
            allPosts[i] = PostView(
                posts[i].message,
                posts[i].author,
                posts[i].timestamp,
                posts[i].likeCount,
                posts[i].usersWhoLiked[user]
            );
        }
        return allPosts;
    }

    function delete_post(uint index) public {
        require(index < posts.length, "Index out of bounds");
        require(posts[index].author == msg.sender, "Only author can delete");

        emit PostDeleted(index, msg.sender);
        delete posts[index];
    }

    function clear_posts() public OnlyOwner {
        emit PostsCleared(msg.sender, posts.length);
        delete posts;
    }
}