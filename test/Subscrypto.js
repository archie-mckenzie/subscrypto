const Subscrypto = artifacts.require('Subscrypto.sol');

contract('Subscrypto', function (accounts) {

    it('Can a new subscription be activated?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        subscrypto.newSubscription(you, 1, 10, {value: 100});
        return assert(subscrypto.isActive(me, you));
    });

    it('Can a subscription pay out?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        subscrypto.newSubscription(you, 1, 10, {value: 100});
        return assert(subscrypto.receiveSubscription(me, {from: you}));
    });

    it('Can it return a function that doesnt exist?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        let success = await subscrypto.isActive(me, you);
        assert.equal(success, false);
        return;
    });

   
});