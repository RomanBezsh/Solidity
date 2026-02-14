const { ethers } = require("hardhat");

async function main() {

    const factory = await ethers.getContractFactory("ProductManager");

    const contract = await factory.deploy();

    await contract.waitForDeployment();

    console.log("ProductManager deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
