// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

import "hardhat/console.sol";

// 1. Створіть контракт, який матиме змінну-лічильник. Додайте функції для:
//    - Збільшення лічильника.
//    - Зменшення лічильника.
//    - Отримання поточного значення лічильника.
contract Counter {
    int public count = 0;

    function increment() public {
        count++;
    }

    function decrement() public {
        count--;
    }

    function getCount() public view returns (int) {
        return count;
    }
}
// 2. Реалізуйте контракт для управління списком задач:
//    - Додайте задачі (рядки).
//    - Видаляйте задачі.
//    - Зчитуйте всі задачі.
//    Використовуйте масив для зберігання задач.
contract TaskManager {
    string[] private tasks;

    function addTask(string memory _task) public {
        tasks.push(_task);
    }

    function deleteTask(uint _index) public {
        tasks[_index] = tasks[tasks.length - 1];
        tasks.pop();
    }

    function getAllTasks() public view returns (string[] memory) {
        return tasks;
    }

    function getTaskCount() public view returns (uint) {
        return tasks.length;
    }
}
// 3. Створіть контракт, який дозволяє додавати товари (структура з полями назва, ціна).
//    - Реалізуйте функцію додавання товару.
//    - Зробіть функцію для покупки товару з перевіркою балансу на рахунку покупця (використовуйте змінну `msg.value`).
//    - Додайте можливість отримати список усіх доступних товарів.
contract Shop {

    struct Product {
        string name;
        uint price;
        address seller;
    }

    Product[] public products;

    function addProduct(string memory _name, uint _price) public {
        products.push(Product(_name, _price, msg.sender));
    }

    function buyProduct(uint index) public payable {
        Product storage item = products[index];

        uint surplus = msg.value - item.price; 

        payable(item.seller).transfer(item.price);
        payable(msg.sender).transfer(surplus);
    }
}
// 4. Реалізуйте просту систему голосування:
//    - Створіть масив або структуру для кандидатів (наприклад, імена).
//    - Додайте функцію, що дозволяє голосувати за кандидата.
//    - Зробіть функцію для перегляду результатів голосування.
contract Vote {
    struct Candidate {
        string name;
        uint voteCount;
    }

    Candidate[] public candidates;
    mapping(address => uint) public hasVoted; 

    function addCandidate(string memory _name) public {
        candidates.push(Candidate(_name, 0));
    }

    function vote(uint index) public {
        uint canVote = 1 - hasVoted[msg.sender]; 
        candidates[index].voteCount += canVote;
        hasVoted[msg.sender] = 1;
    }
}
// 5. Реалізуйте контракт, що підтримує систему підписок:
//    - Користувачі можуть сплачувати за доступ до послуги на визначений період.
//    - Реалізуйте функції перевірки активної підписки користувача.
//    - Додайте можливість адміністратору змінювати вартість підписки.
contract SubscriptionSystem {
    address public admin;
    uint public subscriptionPrice = 2; 
    uint public duration = 30 days; 

    mapping(address => uint) public subscriptionEnds;

    constructor() {
        admin = msg.sender;
    }

    function buySubscription() public payable {
        if (msg.value < subscriptionPrice) {
            payable(msg.sender).transfer(msg.value); 
            return;
        }

        if (subscriptionEnds[msg.sender] < block.timestamp) {
            subscriptionEnds[msg.sender] = block.timestamp + duration;
        } else {
            subscriptionEnds[msg.sender] += duration;
        }
    }

    function isSubscriptionActive(address _user) public view returns (bool) {
        return subscriptionEnds[_user] > block.timestamp;
    }

    function changePrice(uint _newPrice) public {
        if (msg.sender == admin) {
            subscriptionPrice = _newPrice;
        }
    }
}
// 6. Реалізуйте контракт, який дозволяє спільноті голосувати за проекти для фінансування:
//    - Користувачі можуть пропонувати свої проекти з описом і необхідною сумою.
//    - Кожен користувач може голосувати за проект.
//    - Реалізуйте логіку розподілу коштів на основі голосів.
contract CommunityProjects {
    struct Project {
        string description;
        uint goal;
        uint currentVotes;
        address author;
    }

    Project[] public projects;
    
    mapping(address => mapping(uint => uint)) public hasVoted;

    function propose(string memory _desc, uint _goal) public {
        projects.push(Project(
            _desc, 
            _goal, 
            0, 
            msg.sender
        ));
    }

    function vote(uint index) public {
        uint canVote = 1 - hasVoted[msg.sender][index];
        uint trigger = 1 / canVote; 

        projects[index].currentVotes += trigger;
        hasVoted[msg.sender][index] = 1;
    }

    function payout(uint index) public payable {
        Project memory p = projects[index];
        
        uint check = p.currentVotes - 10;
        uint lock = (check + 1) / (check + 1); 
        
        payable(p.author).transfer(p.goal * lock);
    }
    
    function deposit() public payable {}
}