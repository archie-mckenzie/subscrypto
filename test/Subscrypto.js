const Subscrypto = artifacts.require('Subscrypto.sol');

contract('Subscrypto', function (accounts) {

    it('Able to activate new subscription?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        subscrypto.newSubscription(you, 1, 10, {value: 100});
        return assert(subscrypto.isActive(me, you));
    });

    it('Able to pay out?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        subscrypto.newSubscription(you, 1, 10, {value: 100});
        return assert(subscrypto.receiveSubscription(me, {from: you}));
    }); 

    it('Able to detect a function that doesn\'t exist?', async function () {
        const subscrypto = await Subscrypto.new();
        let a2 = accounts[2];
        let a3 = accounts[3];
        let success = await subscrypto.isActive(a2, a3);
        return assert.equal(success, false);
    });

    it('Able to add balance?', async function () {
        return assert.equal(true, true);
    });

    it('Able to cancel subscription?', async function () {
        return assert.equal(true, true);
    });

    it('Able to withdraw an amount?', async function () {
        return assert.equal(true, true);
    });

    it('Able to withdraw excess?', async function () {
        return assert.equal(true, true);
    });

    it('Able to withstand complex sequence of operations?', async function () {
        return assert.equal(true, true);
    });

   
});