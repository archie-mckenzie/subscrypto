const Subscrypto = artifacts.require('Subscrypto.sol');

contract('Subscrypto', function (accounts) {

    it('Can new subscription be activated?', async function () {
        const subscrypto = await Subscrypto.new();
        let me = accounts[0];
        let you = accounts[1];
        subscrypto.send(web3.utils.toWei('100', "ether")).then(subscrypto.newSubscription(you, 1, 10));
        assert(subscrypto.isActive(me, you));
    });

   

});