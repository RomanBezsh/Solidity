import { useState, useEffect } from 'react'
import mediaStoreContract from './lib/contracts/mediaStoreContract';
import lighthouse from "@lighthouse-web3/sdk"

function Media() {

    const apiKey = '####';
    let imageUrl = 'https://gateway.lighthouse.storage/ipfs/'

    const [file, setFile] = useState('');
    const [cid, setCid] = useState('');
    const [account, setAccount] = useState('');
    const [mediaList, setMediaList] = useState([]);

    useEffect(() => {
        const getAccount = async () => {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
            } catch (error) {
                console.error('Error getting account:', error);
            }
        };
        getAccount();
    }, []);

    const loadMediaList = async () => {
        try {
            const arts = await mediaStoreContract.methods.get_arts().call();
            setMediaList(arts);
        } catch (error) {
            console.error('Error loading media:', error);
        }
    };

    useEffect(() => {
        loadMediaList();

        let subscriptionCreated, subscriptionDeleted;

        const startListening = async () => {
            try {
                subscriptionCreated = await mediaStoreContract.events.MeadiaCreated();
                subscriptionCreated.on('data', (event) => {
                    console.log("MediaCreated: ", event.returnValues);
                    loadMediaList();
                });

                subscriptionDeleted = await mediaStoreContract.events.MediaDeleted();
                subscriptionDeleted.on('data', (event) => {
                    console.log("MediaDeleted: ", event.returnValues);
                    loadMediaList();
                });
            } catch (e) {
                console.log("Event subscription error:", e);
            }
        };

        startListening();

        return () => {
            if (subscriptionCreated) subscriptionCreated.unsubscribe();
            if (subscriptionDeleted) subscriptionDeleted.unsubscribe();
        };
    }, []);

    const submitEvent = async (e) => {
        e.preventDefault();
        try {
            const fileUpload = await lighthouse.upload([file], apiKey);
            const uploadedCid = fileUpload.data.Hash;
            setCid(uploadedCid);

            await mediaStoreContract.methods
                .new_art(uploadedCid, file.name)
                .send({ from: account });

            setFile('');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleDelete = async (index) => {
        try {
            await mediaStoreContract.methods
                .delete_art(index)
                .send({ from: account });
        } catch (error) {
            console.error('Error deleting media:', error);
        }
    }

    return (
        <>
            <form onSubmit={submitEvent}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit">Send file to IPFS</button>
            </form>
            {cid && <img src={`${imageUrl}${cid}`} />}
            <div className="media-cards">
                {mediaList.map((media, index) => (
                    !media.isDeleted && (
                        <div className="media-card" key={index}>
                            <img src={`${imageUrl}${media.cid}`} alt={media.name} />
                            <h3>{media.name}</h3>
                            <p>Owner: {media.owner}</p>
                            <p>Date: {new Date(parseInt(media.timestamp) * 1000).toLocaleString()}</p>
                            {media.owner.toLowerCase() === account.toLowerCase() && (
                                <button className="delete-btn" onClick={() => handleDelete(index)}>
                                    Delete
                                </button>
                            )}
                        </div>
                    )
                ))}
            </div>
        </>
    )
}


export default Media;
