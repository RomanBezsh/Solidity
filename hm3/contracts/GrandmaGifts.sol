// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


contract GrandmaGifts {
    address public grandma;
    uint public giftSize; 
    uint public totalGrandchildren; 

    event Withdrawal(address indexed grandchild, uint amount);

    struct Grandchild {
        uint birthday;    
        bool hasWithdrawn; 
        bool isReal;      
    }

    mapping(address => Grandchild) public grandchildren;


    constructor() payable {
        require(msg.value > 0, "Please send some ETH for gifts");
        grandma = msg.sender;
    }

    function addGrandchildren(address[] memory accounts, uint[] memory birthdays) public {
        require(msg.sender == grandma, "Only grandma can do this!");
        require(accounts.length == birthdays.length, "Lists must be same length");

        for (uint i = 0; i < accounts.length; i++) {
            if (grandchildren[accounts[i]].isReal == false) {
                grandchildren[accounts[i]].birthday = birthdays[i];
                grandchildren[accounts[i]].isReal = true;
                totalGrandchildren = totalGrandchildren + 1;
            }
        }
        
        if (totalGrandchildren > 0) {
            giftSize = address(this).balance / totalGrandchildren;
        }
    }

    function takeMyMoney() public {
        Grandchild storage kid = grandchildren[msg.sender];

        require(kid.isReal == true, "You are not in the list!");
        require(block.timestamp >= kid.birthday, "It is not your birthday yet!");
        require(kid.hasWithdrawn == false, "You already took your gift!");

        
        kid.hasWithdrawn = true;
        payable(msg.sender).transfer(giftSize);
        emit Withdrawal(msg.sender, giftSize);
    }
}
