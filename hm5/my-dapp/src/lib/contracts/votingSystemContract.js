import web3 from "../../../lib/web3";
import votingSystem from "./abi/votingSystemAbi.json"

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const votingSystemContract = new web3.eth.Contract(votingSystem, contractAddress);

export default votingSystemContract;
