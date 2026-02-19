import web3 from "../web3";
import counterAbi from "./abi/counterAbi.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const counterContract = new web3.eth.Contract(counterAbi, contractAddress);

export default counterContract;