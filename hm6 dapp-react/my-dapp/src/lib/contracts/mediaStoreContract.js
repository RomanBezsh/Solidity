import web3 from "../web3";
import mediaStoreAbi from "./abi/mediaStoreAbi.json"

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const mediaStoreContract = new web3.eth.Contract(mediaStoreAbi, contractAddress);

export default mediaStoreContract;