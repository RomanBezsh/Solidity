"use strict";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
    "function addProduct(string _name, string _desc, string _imageUrl) public",
    "function getProduct(uint256 _id) public view returns (string, string, address, uint256, string)",
    "function getAllProducts() public view returns ((string name, string desc, address account, uint256 createdAt, string imageUrl)[])"
];


async function addProduct(name, desc, imageUrl) {
    const provider = new ethers.BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.addProduct(name, desc, imageUrl);
    await tx.wait();
}



async function loadProducts() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const products = await contract.getAllProducts();

    const tableBody = document.getElementById("productsBody");
    tableBody.innerHTML = "";

    products.forEach(p => {
        const row = document.createElement("tr");

        const date = new Date(Number(p.createdAt) * 1000).toLocaleString();

        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.desc}</td>
            <td>${p.account}</td>
            <td><img src="${p.imageUrl}" width="100" /></td>
            <td>${date}</td>
        `;

        tableBody.appendChild(row);
    });
}


document.getElementById("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const desc = document.getElementById("desc").value;
    const imageUrl = document.getElementById("image").value;

    await addProduct(name, desc, imageUrl);

    this.reset();
});



loadProducts();