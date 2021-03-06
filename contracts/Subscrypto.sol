// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.9.0;

contract Subscrypto {
    // Data about a subscription
    // Emitted on creation of a new subscription
    // Or on request of one of the two parties involved (sender or receiver)
    event SubscriptionData (
        address indexed sender,
        address indexed receiver,
        uint256 balance,
        uint256 payment_amount,
        uint time_activated,
        uint time_between_payments,
        uint time_last_paid,
        uint time_balance_last_updated
    );

    // Announcement of a cancelled subscription
    // Emitted when cancelSubscription() is called
    event SubscriptionCancelled (
        address indexed sender,
        address indexed receiver,
        uint256 amount_withdrawn
    );

    // SubscriptionInfo struct
    struct SubscriptionInfo {
        address sender; // payer of subscription 
        address receiver; // payee of subscription
        uint256 balance; // unused amount left in subscription 
        uint256 payment_amount; // agreed amount paid at each interval
        uint256 payment_available; // amount ready to be paid out to payee instantly
        uint256 total_paid; // total amount paid out from this subscription
        uint next_payment_time; // next timestamp that payment_amount should be deducted from balance and added to payment_available
        uint last_payment_time; // last time a payment was made from this subscription
        uint time_between_payments; // interval between payment times
        uint time_activated; // time the subscription was created
        uint time_balance_last_updated; // time the balance was last updated
    }

    // Subscrypto Account which contains all subscriptions of a certain user
    struct SubscryptoAccount {
        mapping(address => SubscriptionInfo) subscriptions;
    }

    // Map which stores Subscrypto Accounts for each user
    mapping(address => SubscryptoAccount) accounts;
    
    function newSubscription(address receiver, uint256 payment_amount, uint time_between_payments) public payable {
        // If subscription already exists, do nothing - cannot create two subscriptions with same parties
        if (isActive(msg.sender, receiver)) {
            return;
        } 
        // If subscription does not exist, create new subscription
        require(msg.value >= payment_amount, "Not enough ETH for first payment!");
        accounts[msg.sender].subscriptions[receiver] = SubscriptionInfo(msg.sender, receiver, msg.value - payment_amount, payment_amount, 0, 0, time_between_payments + block.timestamp, 0, time_between_payments, block.timestamp, block.timestamp);
        // Log the new subscription
        emit SubscriptionData(msg.sender, receiver, accounts[msg.sender].subscriptions[receiver].balance, accounts[msg.sender].subscriptions[receiver].payment_amount, accounts[msg.sender].subscriptions[receiver].time_activated, accounts[msg.sender].subscriptions[receiver].time_between_payments, block.timestamp, block.timestamp);
    }

    // Add balance to an existing subscriptionInfo struct
    function addBalance(address receiver) public payable {
        require(isActive(msg.sender, receiver), "Subscription not active!");
        accounts[msg.sender].subscriptions[receiver].balance += msg.value;
        accounts[msg.sender].subscriptions[receiver].time_balance_last_updated = block.timestamp;
        emit SubscriptionData(msg.sender, receiver, accounts[msg.sender].subscriptions[receiver].balance, accounts[msg.sender].subscriptions[receiver].payment_amount, accounts[msg.sender].subscriptions[receiver].time_activated, accounts[msg.sender].subscriptions[receiver].time_between_payments, accounts[msg.sender].subscriptions[receiver].last_payment_time, block.timestamp);

    }

    // Allows a subscriber to withdraw their excess ETH and cancel their subscription 
    function cancelSubscription(address receiver) public payable {
        require(isActive(msg.sender, receiver), "Subscription not active");
        // Update payment amount
        updatePaymentAvailable(msg.sender, receiver);
        // transfer appropriate funds
        payable(msg.sender).transfer(accounts[msg.sender].subscriptions[receiver].balance);
        payable(receiver).transfer(accounts[msg.sender].subscriptions[receiver].payment_available);
        // Log the cancelled subscription
        emit SubscriptionCancelled(msg.sender, receiver, accounts[msg.sender].subscriptions[receiver].balance);
        // Reset the subscription
        delete(accounts[msg.sender].subscriptions[receiver]);
    }
 
    // Withdraws a specified amount from subscription plan
    function withdrawAmount(address receiver, uint256 amount) public payable {
        require(isActive(msg.sender, receiver), "Subscription not active!");
        updatePaymentAvailable(msg.sender, receiver);
        require(accounts[msg.sender].subscriptions[receiver].balance >= amount, "Balance too low!");
        accounts[msg.sender].subscriptions[receiver].balance -= amount;
        payable(msg.sender).transfer(amount);
        accounts[msg.sender].subscriptions[receiver].time_balance_last_updated = block.timestamp;
        if (accounts[msg.sender].subscriptions[receiver].balance < accounts[msg.sender].subscriptions[receiver].payment_amount) {
            cancelSubscription(receiver);
        }
        emit SubscriptionData(msg.sender, receiver, accounts[msg.sender].subscriptions[receiver].balance, accounts[msg.sender].subscriptions[receiver].payment_amount, accounts[msg.sender].subscriptions[receiver].time_activated, accounts[msg.sender].subscriptions[receiver].time_between_payments, accounts[msg.sender].subscriptions[receiver].last_payment_time, block.timestamp);
    }

    // Withdraws any excess ETH being held in escrow by the contract
    // Cancels subscription if balance falls below payment_amount
    function withdrawExcess(address receiver) public payable {
        require(isActive(msg.sender, receiver), "Subscription not active!");
        updatePaymentAvailable(msg.sender, receiver);
        uint256 remainder = accounts[msg.sender].subscriptions[receiver].balance % accounts[msg.sender].subscriptions[receiver].payment_amount;
        accounts[msg.sender].subscriptions[receiver].balance -= remainder;
        payable(msg.sender).transfer(remainder);
        accounts[msg.sender].subscriptions[receiver].time_balance_last_updated = block.timestamp;
        if (accounts[msg.sender].subscriptions[receiver].balance < accounts[msg.sender].subscriptions[receiver].payment_amount) {
            cancelSubscription(receiver);
        }
        emit SubscriptionData(msg.sender, receiver, accounts[msg.sender].subscriptions[receiver].balance, accounts[msg.sender].subscriptions[receiver].payment_amount, accounts[msg.sender].subscriptions[receiver].time_activated, accounts[msg.sender].subscriptions[receiver].time_between_payments, accounts[msg.sender].subscriptions[receiver].last_payment_time, accounts[msg.sender].subscriptions[receiver].time_balance_last_updated);
    }

    // Checks if a subscription or payment over time is currently active, returns true if active, false otherwise
    function isActive(address sender, address receiver) view public returns (bool) {
        return accounts[sender].subscriptions[receiver].next_payment_time != 0;
    }  


    // Emits attributes of a SubscriptionInfo struct
    function getData(address sender, address receiver) public returns (address, address, uint256, uint256, uint, uint) {
        require(msg.sender == sender || msg.sender == receiver, "Access denied to third party");
        require(isActive(sender, receiver), "Subscription not active!");
        emit SubscriptionData(msg.sender, receiver, accounts[msg.sender].subscriptions[receiver].balance, accounts[msg.sender].subscriptions[receiver].payment_amount, accounts[msg.sender].subscriptions[receiver].time_activated, accounts[msg.sender].subscriptions[receiver].time_between_payments, accounts[msg.sender].subscriptions[receiver].last_payment_time, accounts[msg.sender].subscriptions[receiver].time_balance_last_updated);
        return (sender, receiver, accounts[sender].subscriptions[receiver].balance, accounts[sender].subscriptions[receiver].payment_amount, accounts[sender].subscriptions[receiver].time_activated, accounts[sender].subscriptions[receiver].time_between_payments);
    }

    // Called by subscription seller to receive their payment
    function receiveSubscription(address sender) public returns (bool) {
        require(isActive(sender, msg.sender), "Subscription not active!");
        updatePaymentAvailable(sender, msg.sender); // update amount to pay immediately before payment has to be made
        // Cancel subscription if balance is not enough
        if (accounts[sender].subscriptions[msg.sender].balance < accounts[sender].subscriptions[msg.sender].payment_amount) {
            cancelSubscription(msg.sender);
            return false;
        }
        require(accounts[sender].subscriptions[msg.sender].payment_available >= accounts[sender].subscriptions[msg.sender].payment_amount, "No ETH to be collected!");
        payable(msg.sender).transfer(accounts[sender].subscriptions[msg.sender].payment_available);
        accounts[sender].subscriptions[msg.sender].total_paid += accounts[sender].subscriptions[msg.sender].payment_available;
        accounts[sender].subscriptions[msg.sender].last_payment_time = block.timestamp;
        accounts[sender].subscriptions[msg.sender].payment_available = 0;
        emit SubscriptionData(sender, msg.sender, accounts[sender].subscriptions[msg.sender].balance, accounts[sender].subscriptions[msg.sender].payment_amount, accounts[sender].subscriptions[msg.sender].time_activated, accounts[sender].subscriptions[msg.sender].time_between_payments, accounts[sender].subscriptions[msg.sender].last_payment_time,accounts[sender].subscriptions[msg.sender].time_balance_last_updated);
        return true;
    }

    // Update the payment available to collect
    function updatePaymentAvailable(address sender, address receiver) private {
        require(isActive(sender, receiver), "Subscription plan does not exist!");
        while (accounts[sender].subscriptions[receiver].next_payment_time <= block.timestamp) {
            // Check that there is enough balance
            if (accounts[sender].subscriptions[receiver].balance < accounts[sender].subscriptions[receiver].payment_amount) {
                break;
            }
            // Adjust next payment time
            accounts[sender].subscriptions[receiver].next_payment_time += accounts[sender].subscriptions[receiver].time_between_payments;
            // Reduce balance by agreed amount
            accounts[sender].subscriptions[receiver].balance -= accounts[sender].subscriptions[receiver].payment_amount;
            // Increase total ETH available to collect by agreed amount
            accounts[sender].subscriptions[receiver].payment_available += accounts[sender].subscriptions[receiver].payment_amount;
            // Repeat if necessary (maybe the subscription seller hasn't cashed out in a long time?)
        }
    }
}