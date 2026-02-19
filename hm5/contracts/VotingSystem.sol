// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VotingSystem {
    struct Option {
        string name;
        uint voteCount;
    }

    struct Poll {
        string question;
        Option[] options;
        mapping(address => bool) hasVoted;
        bool exists;
    }

    
    event PollCreated(uint indexed pollId, string question, string[] options);
    
    event VoteCast(uint indexed pollId, uint optionIndex, address indexed voter);

    Poll[] public polls;

    function createPoll(
        string memory _question,
        string[] memory _optionNames
    ) public {
        require(
            _optionNames.length > 1,
            "At least two options are required!"
        );

        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.exists = true;

        for (uint i = 0; i < _optionNames.length; i++) {
            newPoll.options.push(Option({name: _optionNames[i], voteCount: 0}));
        }

        emit PollCreated(polls.length - 1, _question, _optionNames);
    }

    function vote(uint _pollId, uint _optionIndex) public {
        Poll storage poll = polls[_pollId];

        require(poll.exists, "Poll doesn't exist");
        require(!poll.hasVoted[msg.sender], "You've already voted");
        require(
            _optionIndex < poll.options.length,
            "Invalid option"
        );

        poll.hasVoted[msg.sender] = true;
        poll.options[_optionIndex].voteCount++;

        // Эмит события голосования
        emit VoteCast(_pollId, _optionIndex, msg.sender);
    }

    function getResults(
        uint _pollId
    ) public view returns (string[] memory names, uint[] memory counts) {
        Poll storage poll = polls[_pollId];
        require(poll.exists, "Poll not found");

        uint len = poll.options.length;
        names = new string[](len);
        counts = new uint[](len);

        for (uint i = 0; i < len; i++) {
            names[i] = poll.options[i].name;
            counts[i] = poll.options[i].voteCount;
        }
    }
}