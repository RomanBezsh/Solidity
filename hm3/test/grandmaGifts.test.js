const { loadFixture, expect, ethers } = require("./setup");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("GrandmaGifts", function () {

    async function deploy() {
        const [grandma, kid1, kid2, stranger] = await ethers.getSigners();
        const depositAmount = ethers.parseEther("10");
        const factory = await ethers.getContractFactory("GrandmaGifts");
        const payments = await factory.deploy({ value: depositAmount });
        await payments.waitForDeployment();

        return { payments, grandma, kid1, kid2, stranger, depositAmount };
    }

    it("1. Перевірити, що бабуся може задеплоїти контракт, внести кошти і задати онуків з датами народження", async function () {
        const { payments, grandma, kid1, kid2 } = await loadFixture(deploy);
        const now = await time.latest();
        await payments.connect(grandma).addGrandchildren([kid1.address, kid2.address], [now + 1000, now + 2000]);

        const kidData = await payments.grandchildren(kid1.address);
        expect(kidData.isReal).to.be.true;
    });

    it("2. Перевірити, що сума правильно ділиться між онуками", async function () {
        const { payments, grandma, kid1, kid2, depositAmount } = await loadFixture(deploy);
        const now = await time.latest();
        await payments.connect(grandma).addGrandchildren([kid1.address, kid2.address], [now + 1000, now + 2000]);

        const giftSize = await payments.giftSize();
        expect(giftSize).to.be.eq(depositAmount / 2n);
    });

    it("3. Успішне зняття у день народження", async function () {
        const { payments, grandma, kid1 } = await loadFixture(deploy);
        const birthday = (await time.latest()) + 5000;
        await payments.connect(grandma).addGrandchildren([kid1.address], [birthday]);

        await time.increaseTo(birthday);
        const giftSize = await payments.giftSize();
        await expect(payments.connect(kid1).takeMyMoney()).to.changeEtherBalance(kid1, giftSize);
    });

    it("4. Успішне зняття після дня народження", async function () {
        const { payments, grandma, kid1 } = await loadFixture(deploy);
        const birthday = (await time.latest()) + 1000;
        await payments.connect(grandma).addGrandchildren([kid1.address], [birthday]);

        await time.increase(20000);
        const giftSize = await payments.giftSize();
        await expect(payments.connect(kid1).takeMyMoney()).to.changeEtherBalance(kid1, giftSize);
    });

    it("5. Спроба зняти до дня народження: виклик до дня народження → транзакцію відхилено", async function () {
        const { payments, grandma, kid1 } = await loadFixture(deploy);
        const futureBirthday = (await time.latest()) + 10000;
        await payments.connect(grandma).addGrandchildren([kid1.address], [futureBirthday]);

        await expect(payments.connect(kid1).takeMyMoney()).to.be.revertedWith("It is not your birthday yet!");
    });

    it("6. Повторне зняття: онук намагається зняти повторно → транзакцію відхилено", async function () {
        const { payments, grandma, kid1 } = await loadFixture(deploy);
        const birthday = (await time.latest()) + 100;
        await payments.connect(grandma).addGrandchildren([kid1.address], [birthday]);
        await time.increaseTo(birthday);

        await payments.connect(kid1).takeMyMoney();
        await expect(payments.connect(kid1).takeMyMoney()).to.be.revertedWith("You already took your gift!");
    });

    it("7. Спроба стороннього виклику", async function () {
        const { payments, stranger } = await loadFixture(deploy);
        await expect(payments.connect(stranger).takeMyMoney()).to.be.revertedWith("You are not in the list!");
    });

    it("8. Подія при знятті: перевірка, що при знятті генерується правильна подія з адресою та сумою", async function () {
        const { payments, grandma, kid1 } = await loadFixture(deploy);
        const birthday = (await time.latest()) + 100;
        await payments.connect(grandma).addGrandchildren([kid1.address], [birthday]);
        await time.increaseTo(birthday);

        const giftSize = await payments.giftSize();

        await expect(payments.connect(kid1).takeMyMoney())
            .to.emit(payments, "Withdrawal")
            .withArgs(kid1.address, giftSize);
    });

});