const Subscrypto = artifacts.require('Subscrypto.sol');

async function shouldCauseRevert(fun) {
    let potentialError = null;
  
    try {
      await fun();
    }
    catch (error) {
      potentialError = error
    }
  
    return assert.ok(potentialError instanceof Error);
  }

contract('Subscrypto', function (accounts) {

    it('Able to activate new subscription?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        await subscrypto.newSubscription(you, 1, 10, {value: 100});
        return assert(await subscrypto.isActive(me, you));
    });

    it('Cannot activate subscription with insufficient funds?', async function () {
        const subscrypto = await Subscrypto.new();
        let you = accounts[1];
        return await shouldCauseRevert(async () => {
            await subscrypto.newSubscription(you, 10, 10, {value: 1});
        })
    });

    it('Able to pay out?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        await subscrypto.newSubscription(you, 1, 10, {value: 100});
        return assert(await subscrypto.receiveSubscription(me, {from: you}));
    }); 

    it('Able to detect a function that doesn\'t exist?', async function () {
        const subscrypto = await Subscrypto.new();
        let a2 = accounts[2];
        let a3 = accounts[3];
        let success = await subscrypto.isActive(a2, a3);
        return assert.equal(success, false);
    });

    it('Able to add balance?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        let addVal = 100;
        await subscrypto.newSubscription(you, 1, 10, {value: 100});
        await subscrypto.addBalance(you, {value: addVal});
        let bal = (await subscrypto.getData.call(me,you))['2'].toNumber();
        return assert.equal(bal, 99+addVal);
    });

    it('Able to cancel subscription?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        await subscrypto.newSubscription(you, 1, 10, {value: 100});
        await subscrypto.cancelSubscription(you);
        let success = await subscrypto.isActive(me, you);
        return assert.equal(success, false);
    });

    it('Able to withdraw an amount?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        let amount = 50;
        await subscrypto.newSubscription(you, 1, 10, {value: 100});
        await subscrypto.withdrawAmount(you, amount)
        let bal = (await subscrypto.getData.call(me,you))['2'].toNumber();
        return assert.equal(bal, 99-amount);
    });

    it('Cannot withdraw more than balance?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        let amount = 100;
        await subscrypto.newSubscription(you, 10, 10, {value: 50});
        return await shouldCauseRevert(async () => {
            await subscrypto.withdrawAmount(you, amount);
        })
    });

    it('Able to withdraw excess?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        await subscrypto.newSubscription(you, 10, 1, {value: 100});
        await subscrypto.withdrawExcess(you);
        let bal = (await subscrypto.getData.call(me,you))['2'].toNumber();
        return assert.equal(bal, 90);
    });

    it('Cannot receive double subscription payments?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        let addVal = 100;
        await subscrypto.newSubscription(you, 10, 10, {value: 100});
        await subscrypto.receiveSubscription(me, {from: you});
        return await shouldCauseRevert(async () => {
            await subscrypto.receiveSubscription(me, {from: you});
        })
    });

    it('Able to withstand complex sequence of operations?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        let addVal = 100;
        await subscrypto.newSubscription(you, 10, 10, {value: 100});
        await subscrypto.withdrawExcess(you);
        await subscrypto.addBalance(you, {value: addVal});
        await subscrypto.receiveSubscription(me, {from: you});
        await subscrypto.cancelSubscription(you);
        await subscrypto.newSubscription(you, 1, 10, {value: 100});
        await subscrypto.withdrawAmount(you, 20)
        await subscrypto.receiveSubscription(me, {from: you});
        let bal = (await subscrypto.getData.call(me,you))['2'].toNumber();
        return assert.equal(bal, 79);
    });

   
});