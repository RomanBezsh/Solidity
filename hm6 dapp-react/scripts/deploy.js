const { ethers } = require("hardhat");

(
    async () => {
        const factory = await ethers.getContractFactory("MediaStore");
        const contract = await factory.deploy();

        await contract.waitForDeployment();

        console.log("Contract deployed at: ", await contract.getAddress());
    }
)().catch((error) => {
    console.error("Deploy error: ", error);
    process.exitCode = -1;
})