import { useState, useEffect } from 'react';
import votingSystemContract from './lib/contracts/votingSystemContract.js';


function Voting() {
    const [account, setAccount] = useState('');
    const [polls, setPolls] = useState([]);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState('');

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

    const loadPolls = async () => {
        try {
            const pollsList = [];
            let i = 0;
            let exists = true;
            
            while (exists) {
                try {
                    const poll = await votingSystemContract.methods.polls(i).call();
                    const results = await votingSystemContract.methods.getResults(i).call();
                    
                    pollsList.push({
                        id: i,
                        question: poll.question,
                        options: results.names,
                        votes: results.counts
                    });
                    i++;
                } catch (e) {
                    exists = false;
                }
            }
            setPolls(pollsList);
        } catch (error) {
            console.error('Error loading polls:', error);
        }
    };

    useEffect(() => {
        loadPolls();

        let subCreated, subVoted;

        const startListening = async () => {
            try {
                subCreated = await votingSystemContract.events.PollCreated();
                subCreated.on('data', (event) => {
                    console.log("Event: PollCreated", event.returnValues);
                    loadPolls();
                });

                subVoted = await votingSystemContract.events.VoteCast();
                subVoted.on('data', (event) => {
                    console.log("Event: VoteCast", event.returnValues);
                    loadPolls();
                });
            } catch (e) {
                console.log("Event subscription error:", e);
            }
        };

        startListening();

        return () => {
            if (subCreated) subCreated.unsubscribe();
            if (subVoted) subVoted.unsubscribe();
        };
    }, []);

    const createPoll = async (e) => {
        e.preventDefault();
        const optionsArray = options.split(',').map(s => s.trim()).filter(s => s !== "");
        
        try {
            await votingSystemContract.methods
                .createPoll(question, optionsArray)
                .send({ from: account });
            
            setQuestion('');
            setOptions('');
        } catch (error) {
            console.error('Error creating poll:', error);
        }
    };

    const handleVote = async (pollId, optionIndex) => {
        try {
            await votingSystemContract.methods
                .vote(pollId, optionIndex)
                .send({ from: account });
        } catch (error) {
            console.error('Error voting:', error);
            alert("Already voted or transaction failed.");
        }
    };

    return (
        <div className="voting-container">
            <div className="account-info">Connected: {account}</div>

            <form className="poll-form" onSubmit={createPoll}>
                <h3>New Voting Poll</h3>
                <input 
                    type="text" 
                    placeholder="Enter your question..." 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Options: Yes, No, Maybe..." 
                    value={options} 
                    onChange={(e) => setOptions(e.target.value)} 
                    required 
                />
                <button className="submit-btn" type="submit">Create Poll</button>
            </form>

            <div className="media-cards">
                {polls.map((poll) => (
                    <div className="poll-card" key={poll.id}>
                        <h4>{poll.question}</h4>
                        {poll.options.map((name, idx) => (
                            <div className="option-row" key={idx}>
                                <button className="vote-btn" onClick={() => handleVote(poll.id, idx)}>
                                    {name}
                                </button>
                                <span className="vote-count">{poll.votes[idx].toString()}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Voting;