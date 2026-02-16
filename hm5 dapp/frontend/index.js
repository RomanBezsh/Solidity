// import Contract from 'web3-eth-contract'

const contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let web3;
let contract;
let current_account;

document.addEventListener('DOMContentLoaded', () => {
    const connectionButton = document.getElementById("connectionButton");
    connectionButton.addEventListener("click", connectWallet);

    const makePostButton = document.getElementById("makePostButton");
    makePostButton.addEventListener('click', makePost);

    const getPostsButton = document.getElementById("getPostsButton");
    getPostsButton.addEventListener('click', getPost);

    const clearPostButton = document.getElementById("clearPostButton");
    clearPostButton.addEventListener('click', clearPosts);

    const authorFilter = document.getElementById("authorFilter");
    authorFilter.addEventListener('change', (e) => {
        renderPosts(e.target.value);
    });

    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        // console.log("ABI: ", abi)
        contract = new web3.eth.Contract(abi, contract_address);

        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
                current_account = accounts[0];
                enterToDapp();
            }
        })
    } else alert("Install web3 provider(MetaMask, Infura, etc.)");

    contract.events.PostCreated({ fromBlock: 'latest' })
        .on("data", event => {
            console.log("PostCreated: ", event.returnValues);
            renderPosts(document.getElementById("authorFilter").value);
        })

    contract.events.PostsCleared({ fromBlock: 'latest' })
        .on("data", event => {
            console.log("PostsCleared: ", event.returnValues);
            renderPosts();
        })

    contract.events.PostDeleted({ fromBlock: 'latest' })
        .on("data", event => {
            console.log("Post deleted index: ", event.returnValues.index);
            renderPosts(document.getElementById("authorFilter").value);
        })

    contract.events.PostLiked({ fromBlock: 'latest' })
        .on("data", event => {
            console.log("PostLiked: ", event.returnValues);
            renderPosts(document.getElementById("authorFilter").value);
        })
})

const enterToDapp = () => {
    const accountLabel = document.getElementById('accountLabel');
    accountLabel.hidden = false;
    accountLabel.textContent = current_account;
    accountLabel.style.color = 'darkgreen';
    const dapp = document.getElementById("dapp");
    dapp.hidden = false;

    renderPosts();
}

const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            }).catch((error) => {
                if (error.code === 4001) {
                    alert("User canceled transaction");
                }
            })
            console.log(accounts);
            current_account = accounts[0];
            enterToDapp();
        }
        catch (error) {
            console.error(error);
        }
    }
    else alert("Install web3 provider(MetaMask, Infura, etc.)");
}

const makePost = async () => {
    try {
        const input = document.getElementById("postInput");
        const message = input.value;
        if (!message) return alert("Message empty");

        const tx = await contract.methods.create_post(message).send({ from: current_account });
        console.log("Transact: ", tx);
        input.value = "";
    } catch (error) {
        console.error("Create error: ", error);
        alert("Create post error. See console logs");
    }
}

const getPost = async () => {
    try {
        const post = await contract.methods.get_post(0).call();
        console.log(post);
    } catch (error) {
        console.error("Get posts error: ", error);
        alert("Get posts error. See console logs");
    }
}

const toggleLike = async (index) => {
    try {
        await contract.methods.toggle_like(index).send({ from: current_account });
        renderPosts(document.getElementById("authorFilter").value);
    } catch (error) {
        console.error("Like error:", error);
    }
};

const renderPosts = async (filter = "all") => {
    try {
        if (!current_account) return;

        const posts = await contract.methods.get_posts(current_account).call();
        const container = document.getElementById("posts");
        container.innerHTML = "";

        posts.forEach((post, index) => {
            if (!post.message || post.message === "") return;
            if (filter === "mine" && post.author.toLowerCase() !== current_account.toLowerCase()) return;

            const div = document.createElement("div");
            div.className = "post-card";

            div.innerHTML = `
                <div class="post-meta">
                    Author: <b class="post-author">${post.author}</b><br>
                    Date: ${new Date(Number(post.timestamp) * 1000).toLocaleString()}
                </div>
                <p class="post-message">${post.message}</p>
                <div class="post-actions">
                    <button id="like-${index}" class="like-btn ${post.iLiked ? 'active' : ''}">
                        ${post.iLiked ? '❤️' : '🤍'} Like (${post.likeCount})
                    </button>
                </div>
            `;

            div.querySelector(`#like-${index}`).onclick = () => toggleLike(index);

            if (post.author.toLowerCase() === current_account.toLowerCase()) {
                const delBtn = document.createElement("button");
                delBtn.className = "delete-btn";
                delBtn.textContent = "🗑 Delete";
                delBtn.onclick = async () => {
                    try {
                        await contract.methods.delete_post(index).send({ from: current_account });
                    } catch (e) { console.error("Deletion cancelled", e); }
                };
                div.appendChild(delBtn);
            }

            container.appendChild(div);
        });
    } catch (error) {
        console.error("Render error:", error);
    }
};

const clearPosts = async () => {
    try {
        await contract.methods.clear_posts().send({ from: current_account });
    } catch (error) {
        console.error("Clear posts error: ", error);
        alert("Clear posts error. See console logs.");
    }
}












