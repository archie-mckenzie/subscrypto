# Subscrypto

Subscrypto is a dApp for payment over time on the Ethereum blockchain. 

*Note to COS 495 Staff: We have continued working on this project post Dean's Date due to our grant agreement with the Ethereum Foundation. Feel free to use our last commit before Dean's Date for grading purposes. To run the code, follow the "Run locally" instructions below.*

Here's a brief overview of how the smart contract works:

Each wallet has a corresponding Subscrypto Account which contains a map of their subscriptions.

Subscriptions contain information about the sender (subscriber), receiver (seller), subscription balance, 
amount currently available to collect, agreed amount to be paid, and interval at which that amount is paid.

For example, if we had a SubscriptionInfo struct which looked like this:

    SubscriptionInfo {
        sender = aaronskepasts.eth
        receiver = philliptaylor.eth
        balance = 100 ETH
        payment_amount = 10 ETH
        payment_available = 20 ETH
        total_paid = 0 ETH
        next_payment_time = now + 26 days
        last_payment_time = now - 4 days
        time_between_payments = 1 month
        time_activated = now - 2 months - 4 days 
        time_balance_last_updated = 2 months - 4 days
    }

We could deduce that Aaron was making a payment over time to Phillip. Aaron agreed to pay Phillip 10 ETH per month for the next year. Aaron paid 120 ETH upfront and two months have passed already. However, Phillip has not collected the 20 ETH available to him yet. Instead, the smart contract is holding it in escrow.

# Run locally

Dependencies:
For simple, zero-configuration command-line static HTTP server:

` npm install http-server`

Run:

`git clone https://github.com/archie-mckenzie/subscrypto.git`

`cd Web`

`http-server`

Navigate to `localhost:8080` on a browser to access the Subscrypto web app.




