// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.9.0;

contract Subscrypto {
    // Constants for time periods (s)
    uint constant day = 24 hours;
    uint constant week = 1 weeks;
    uint constant year = 365.25 days;
    uint constant month = year / 12;

    // Struct which stores SubscriptionInfo structs
    mapping(address => SubscryptoAccount) accounts;

    // SubscriptionInfo struct
    struct SubscriptionInfo {
        address sender; // payer of subscription 
        address receiver; // seller of subscription
        uint256 balance; // unused amount left in subscription 
        uint256 payment_amount; // agreed amount paid at each interval
        uint256 payment_available; // amount ready to be paid out instantly
        uint next_payment_time; // next timestamp that payment_amount should be deducted from balance and added to payment_available
        uint time_between_payments; // interval between payment times
    }

    // Subscrypto Account which contains all subscriptions of a certain user
    struct SubscryptoAccount {
        mapping(address => SubscriptionInfo) subscriptions;
    }
    
    // Create a new SubscriptionInfo struct
    SubscriptionInfo s;
    function newSubscription(address receiver, uint256 payment_amount, uint time_between_payments) public payable {
        // If subscription already exists, add balance to itinstead of creating new
        if (accounts[msg.sender].subscriptions[receiver].next_payment_time != 0) {
            addBalance(receiver);
        } else { // If subscription does not exist, create new subscription
            s = SubscriptionInfo(msg.sender, receiver, msg.value, payment_amount, 0, 0, time_between_payments);
            if (s.balance >= payment_amount) {
                s.balance = s.balance - payment_amount;
                s.payment_available = payment_amount;
            }
            s.next_payment_time = s.time_between_payments + block.timestamp;
            accounts[msg.sender].subscriptions[receiver] = s;
        }
    }

    // Add balance to an existing subscriptionInfo struct
    function addBalance(address receiver) public payable {
        accounts[msg.sender].subscriptions[receiver].balance = accounts[msg.sender].subscriptions[receiver].balance + msg.value;
    }

    // Called by subscription seller to receive their payment
    function receiveSubscription(address sender) public {
        updatePaymentAvailable(sender, msg.sender); // update amount to pay only when payment has to be made
        payable(msg.sender).transfer(accounts[sender].subscriptions[msg.sender].payment_available);
        accounts[sender].subscriptions[msg.sender].payment_available = 0;
    }

    // Update the payment available to collect
    function updatePaymentAvailable(address sender, address receiver) public {
        while (accounts[sender].subscriptions[receiver].next_payment_time <= block.timestamp) {
            // Check that there is enough balance
            if (accounts[sender].subscriptions[receiver].balance < accounts[sender].subscriptions[receiver].payment_amount) {
                break;
            }
            // Reduce balance by agreed amount
            accounts[sender].subscriptions[receiver].balance = accounts[sender].subscriptions[receiver].balance - accounts[sender].subscriptions[receiver].payment_amount;
            // Increase total ETH available to collect by agreed amount
            accounts[sender].subscriptions[receiver].payment_available = accounts[sender].subscriptions[receiver].payment_available + accounts[sender].subscriptions[receiver].payment_amount;
            // Adjust next payment time
            accounts[sender].subscriptions[receiver].next_payment_time = accounts[sender].subscriptions[receiver].next_payment_time + accounts[sender].subscriptions[receiver].time_between_payments;
            // Repeat if necessary (maybe the subscription seller hasn't cashed out in a long time?)
        }
    }
}




