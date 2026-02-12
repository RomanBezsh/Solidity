// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

import "hardhat/console.sol";

// 1. Разработайте интерфейс IQuest, который определяет методы для управления квестами (например, startQuest, completeQuest, getReward). 
// Затем создайте контракт QuestManager, который реализует этот интерфейс и управляет квестами для игроков. 
// Реализуйте систему наград и уровней.


interface IQuest {
    function createQuest(uint _questId, uint rewardAmount, uint minLevel, uint expGain) external;
    function updateQuest( uint _questId, uint newRewardAmount, uint newMinLevel, uint newExpGain) external;
    function startQuest(uint _questId) external;
    function completeQuest(uint _questId) external;
    function getReward(uint _questId) external view returns (uint);
    function getPlayerStats(address _player) external view returns (uint level, uint exp);
}


contract QuestManager is IQuest {
    
    struct Player {
        uint level;
        uint totalExperience;
        mapping(uint => bool) completedQuests;
        mapping(uint => bool) activeQuests;
    }

    struct Quest {
        uint rewardAmount;
        uint minLevel;
        uint expGain;
    }

    mapping(address => Player) public players;
    mapping(uint => Quest) public quests;
    
    constructor() {
        quests[1] = Quest(200, 1, 400);
    }


    function createQuest(uint _questId, uint rewardAmount, uint minLevel, uint expGain) external override {
        require(_questId > 0, "Invalid quest id");
        require(quests[_questId].rewardAmount == 0, "Quest already exists");
        require(rewardAmount > 0, "Reward must be > 0");
        require(minLevel > 0, "Min level must be > 0");
        require(expGain > 0, "EXP must be > 0");

        quests[_questId] = Quest({
            rewardAmount: rewardAmount,
            minLevel: minLevel,
            expGain: expGain
        });
    }

    function updateQuest( uint _questId, uint newRewardAmount, uint newMinLevel, uint newExpGain) external {
        Quest storage quest = quests[_questId];

        require(quest.rewardAmount > 0, "Quest does not exist");
        require(newRewardAmount > 0, "Reward must be > 0");
        require(newMinLevel > 0, "Min level must be > 0");
        require(newExpGain > 0, "EXP must be > 0");

        quest.rewardAmount = newRewardAmount;
        quest.minLevel = newMinLevel;
        quest.expGain = newExpGain;
    }


    function startQuest(uint _questId) external override   {
        Quest storage quest = quests[_questId];
        Player storage player = players[msg.sender];

        require(quest.rewardAmount > 0, "Quest not found");
        
        if(player.level == 0) player.level = 1;

        require(player.level >= quest.minLevel, "Level too low");
        require(!player.completedQuests[_questId], "Already done");
        require(!player.activeQuests[_questId], "Already active");

        player.activeQuests[_questId] = true;
    }

    function completeQuest(uint _questId) external override {
        Player storage player = players[msg.sender];
        require(player.activeQuests[_questId], "Not active");

        player.activeQuests[_questId] = false;
        player.completedQuests[_questId] = true;
        
        player.totalExperience += quests[_questId].expGain;
        player.level = (player.totalExperience / 100) + 1;
    }


    function getReward(uint _questId) external view override returns (uint) {
        return quests[_questId].rewardAmount;
    }

    function getPlayerStats(address _player) external view override returns (uint level, uint exp) {
        return (players[_player].level, players[_player].totalExperience);
    }

}

// 2. Разработайте библиотеку ResourceUtils, которая содержит функции для управления игровыми ресурсами: распределение энергии, вычисление стоимости апгрейдов, 
// оптимизация расхода золота. Затем создайте контракт ResourceManager, который использует эту библиотеку для управления ресурсами игроков.

library ResourceUtils {

    function calculateUpgradeCost(uint _baseCost, uint _currentLevel) internal pure returns (uint) {
        if (_currentLevel == 0) return _baseCost;
        uint multiplier = 115;
        uint cost = _baseCost;
        for (uint i = 0; i < _currentLevel; i++) {
            cost = (cost * multiplier) / 100;
        }
        return cost;
    }

    function calculateEnergyRecovery(uint _lastTimestamp, uint _recoveryRate, uint _maxEnergy) internal view returns (uint) {
        uint timePassed = block.timestamp - _lastTimestamp;
        uint recovered = timePassed * _recoveryRate;
        return recovered > _maxEnergy ? _maxEnergy : recovered;
    }

    function getDiscountedPrice(uint _price, uint _playerLevel) internal pure returns(uint) {
        uint discount = _playerLevel > 25 ? 25 : _playerLevel;
        return (_price * (100 - discount)) / 100;
    }
}

contract ResourceManager {
    using ResourceUtils for uint;

    struct PlayerResources {
        uint gold;
        uint energy;
        uint lastEnergyUpdate;
        uint farmLevel;
    }

    mapping(address => PlayerResources) public players;

    uint public constant baseUpgradeCost = 100;
    uint public constant maxEnergy = 100;
    uint public constant recoveryRate = 1;

    function joinGame() external {
        require(players[msg.sender].lastEnergyUpdate == 0, "Already in game");
        players[msg.sender] = PlayerResources(500, maxEnergy, block.timestamp, 1);
    }

    function upgradeFarm() external {
        PlayerResources storage player = players[msg.sender];
        uint rawCost = ResourceUtils.calculateUpgradeCost(baseUpgradeCost, player.farmLevel);
        uint finalCost = rawCost.getDiscountedPrice(player.farmLevel);
        
        require(player.gold >= finalCost, "Not enough gold");

        player.gold -= finalCost;
        player.farmLevel++;
    }

    function refreshEnergy() external {
        PlayerResources storage player = players[msg.sender];
        uint recovered = ResourceUtils.calculateEnergyRecovery(
            player.lastEnergyUpdate,
            recoveryRate,
            maxEnergy
        );

        player.energy = recovered;
        player.lastEnergyUpdate = block.timestamp;
    }

    function getNextUpgredePrice(address _player) external view returns(uint) {
        uint level = players[_player].farmLevel;
        return ResourceUtils.calculateUpgradeCost(baseUpgradeCost, level).getDiscountedPrice(level);
    }

}




// 3. Создайте базовый контракт WarriorGuild, который управляет регистрацией воинов. Затем создайте несколько подклассов: Knight, Mage и Assassin. 
// Каждый из них должен наследовать WarriorGuild и добавлять уникальные способности, например, attack() с разными механиками урона.


contract WarriorGuild {
    struct Warrior {
        string name;
        uint level;
        uint health;
        bool isRegistered;
    }

    mapping(address => Warrior) public warriors;

    function register(string memory _name) public virtual {
        require(!warriors[msg.sender].isRegistered, "Already registered");
        warriors[msg.sender] = Warrior(_name, 1, 100, true);
    }

    function attack() public view virtual returns (string memory, uint) {
        return ("Basic Attack", 10);
    }
}

contract Knight is WarriorGuild {
    function register(string memory _name) public override {
        super.register(_name);
        warriors[msg.sender].health = 200; 
    }

    function attack() public view override returns (string memory, uint) {
        return ("Sword Slash", 25);
    }
}


contract Mage is WarriorGuild {
    function attack() public view override returns (string memory, uint) {
        uint magicDamage = 15 * warriors[msg.sender].level;
        return ("Fireball", magicDamage);
    }
}

contract Assassin is WarriorGuild {
    function attack() public view override returns (string memory, uint) {
        uint damage = 20;
        if (block.timestamp % 2 == 0) {
            return ("Critical Strike", damage);
        }
        return ("Dagger Stab", damage);
    }
}













