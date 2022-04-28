const Subscrypto = artifacts.require('Subscrypto.sol');

contract('Subscrypto', () => {

    const subscrypto = await Subscrypto.new();

    it('Activating new subscription', () => {
        // await subscrypto.newSubscription();
    });

   

});