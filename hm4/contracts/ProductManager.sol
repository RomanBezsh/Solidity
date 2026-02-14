// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ProductManager {
    struct Product {
        string name;
        string desc;
        address account;
        uint createdAt;
        string imageUrl;
    }

    mapping(uint => Product) products;
    uint public productCount;

    function addProduct(
        string memory _name,
        string memory _desc,
        string memory _imageUrl
    ) public {
        products[productCount] = Product({
            name: _name,
            desc: _desc,
            account: msg.sender,
            createdAt: block.timestamp,
            imageUrl: _imageUrl
        });
        productCount++;
    }

    function getProduct(
        uint _id
    )
        public
        view
        returns (string memory, string memory, address, uint, string memory)
    {
        Product memory p = products[_id];
        return (p.name, p.desc, p.account, p.createdAt, p.imageUrl);
    }

    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](productCount);

        for (uint i = 0; i < productCount; i++) {
            allProducts[i] = products[i];
        }

        return allProducts;
    }
}
