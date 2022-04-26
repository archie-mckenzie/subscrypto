# Subscrypto

Subscrypto is a dApp for payment over time on the Ethereum blockchain. 

Here's a brief overview of how the smart contract works:

Each wallet has a corresponding Subscrypto Account which contains a map of their subscriptions.

Subscriptions contain information about the sender (subscriber), receiver (seller), subscription balance, 
amount currently available to collect, agreed amount to be paid, and interval at which that amount is paid.

For example, if we had a SubscriptionInfo struct which looked like this:

    SubscriptionInfo {
        sender = aaron
        receiver = phillip
        balance = 100 ETH
        payment_amount = 10 ETH
        payment_available = 20 ETH
        total_paid = 0 ETH
        next_payment_time = now + 26 days
        last_payment_time = now - 4 days
        time_between_payments = 1 month
    }

We could deduce that Aaron was making a payment over time to Phillip. Aaron agreed to pay Phillip 10 ETH 
per month for the next year. Aaron paid 120 ETH upfront and two months have passed already. However, Phillip has not collected the 20 ETH available to him yet. Instead, the smart contract is holding it in escrow.