const MONTH_LEN = 2592000;
const WEEK_LEN = 604800;
const ETH_TO_WEI = 1e18;
//const subCard = document.getElementById("subCard");
// const subsContainer = document.getElementById("subsContainer");

async function cancelSubscription(sender, receiver) {
  await window.contract.methods
    .cancelSubscription(receiver)
    .send({ from: sender });
}

async function addBalance(sender, receiver) {
  const val = BigInt(
    Math.round(
      parseFloat(document.getElementById("addAmount").value) * ETH_TO_WEI
    )
  ).toString();
  console.log(val);
  await window.contract.methods
    .addBalance(receiver)
    .send({ from: sender, value: val });
}

async function withdraw(sender, receiver) {
  const val = BigInt(
    Math.round(
      parseFloat(document.getElementById("withdrawAmount").value) * ETH_TO_WEI
    )
  ).toString();
  console.log(val);
  await window.contract.methods
    .withdrawAmount(receiver, val)
    .send({ from: sender });
}

async function cancelButtonClick(receiver) {
  console.log(receiver);
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const sender = accounts[0];
        cancelSubscription(sender, receiver);
      })
      .catch((error) => {
        console.log(error, error.code);
      });
  }
}

async function addButtonClick(receiver) {
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const sender = accounts[0];
        addBalance(sender, receiver);
      })
      .catch((error) => {
        console.log(error, error.code);
      });
  }
}

async function withdrawButtonClick(receiver) {
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const sender = accounts[0];
        withdraw(sender, receiver);
      })
      .catch((error) => {
        console.log(error, error.code);
      });
  }
}

refreshButton.addEventListener("click", () => {
  //console.log("h");
  //addNewSubCard("archie", "4.20", "01/01/1010", "1 week", "01/10/2020", "200");
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        loadEvents(accounts[0]);
      })
      .catch((error) => {
        console.log(error, error.code);
        //alert(error.code);
      });
  }
});

async function loadWeb3() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable();
  }
}

async function loadContract() {
  const response = await fetch("Subscrypto.json");
  const data = await response.json();
  abi = data["abi"];
  addr = data["networks"]["3"]["address"];
  return new window.web3.eth.Contract(abi, addr);
}
async function load() {
  await loadWeb3();
  window.contract = await loadContract();
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        loadEvents(accounts[0]);
      })
      .catch((error) => {
        console.log(error, error.code);
        //alert(error.code);
      });
  }
}

async function isActive(sender, receiver) {
  return await window.contract.methods.isActive(sender, receiver).call();
}

async function loadEvents(account) {
  document.getElementById("subsContainer").innerHTML = "";
  window.contract
    .getPastEvents("SubscriptionData", {
      filter: { sender: account },
      // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    })
    .then(async function (events) {
      //console.log(events); // same results as the optional callback above
      var subs = new Set();
      for (const [key, value] of Object.entries(events).reverse()) {
        const returnDict = value.returnValues;
        const active = await isActive(account, returnDict["receiver"]);
        if (!active || subs.has(returnDict["receiver"])) {
          continue;
        }
        subs.add(returnDict["receiver"]);
        const recStr =
          returnDict["receiver"].substr(0, 8) +
          "..." +
          returnDict["receiver"].substr(returnDict["receiver"].length - 4);

        const recurrance = parseInt(returnDict["time_between_payments"]);
        const timeActivated = parseInt(returnDict["time_activated"]);
        const balanceInt = Number(BigInt(returnDict["balance"])) / ETH_TO_WEI;
        const paymentAmountInt =
          Number(BigInt(returnDict["payment_amount"])) / ETH_TO_WEI;

        const balance = "" + balanceInt;
        const paymentAmount = "" + paymentAmountInt;

        // get string of subscription activation datee
        let startDate = new Date(timeActivated * 1000);
        let month = startDate.getMonth() + 1;
        const dateActivated =
          month + "/" + startDate.getDate() + "/" + startDate.getFullYear();

        // find next payment date
        let currentSecs = new Date().getTime() / 1000;
        let nextPaymentNum = ~~((currentSecs - timeActivated) / recurrance) + 1;
        let nextPaymentInSecs = timeActivated + nextPaymentNum * recurrance;
        let nextDate = new Date(nextPaymentInSecs * 1000);
        let month1 = nextDate.getMonth() + 1;
        const nextPayment =
          month1 + "/" + nextDate.getDate() + "/" + nextDate.getFullYear();

        //const curBalance = balance - ~~((currentSecs - returnDict["time_last_balance_update"]))/recurrance) * paymentAmountInt;

        // build recurrance string
        let recurStr = "";
        let recurVal = recurrance;
        if (recurVal >= MONTH_LEN) {
          recurStr += ~~(recurVal / MONTH_LEN) + " month";
          if (recurVal >= MONTH_LEN * 2) {
            recurStr += "s";
          }
          recurVal = recurVal % MONTH_LEN;
          recurStr += " ";
        }
        if (recurVal >= WEEK_LEN) {
          recurStr += ~~(recurVal / WEEK_LEN) + " week";
          if (recurVal >= WEEK_LEN * 2) {
            recurStr += "s";
          }
          recurVal = recurVal % WEEK_LEN;
          recurStr += " ";
        }
        recurStr += recurVal + " seconds";
        addNewSubCard(
          returnDict["receiver"],
          paymentAmount,
          nextPayment,
          recurStr,
          dateActivated,
          balance
        );
      }
    });
}

// all inputs strings which we add to the html using ${}
async function addNewSubCard(
  receiverAcct,
  paymentAmount,
  nextPayment,
  recurrance,
  dateActivated,
  balance
) {
  const recStr =
    receiverAcct.substr(0, 8) +
    "..." +
    receiverAcct.substr(receiverAcct.length - 4);
  document.getElementById(
    "subsContainer"
  ).innerHTML += `<div id="subCard" class="rounded-xl overflow-hidden shadow-lg bg-gray-300">
                        <div class="px-6 py-4">
                          <div class="flex flex-row">
                            <div id="subTo" class="font-bold text-xl mb-2 basis-3/4">To: ${recStr}</div>
                            <button id="cancelButton" class="bg-red-500 hover:bg-red-700 basis-1/4  px-3 py-1 text-sm font-semibold text-white rounded-full" onclick="cancelButtonClick('${receiverAcct}');" >
                              Cancel
                          </div>
                          
                        </div>
                        <div class="px-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
                          <div class="">
                            <div class="font-bold text-sm mb-2">
                              Payment Amount
                            </div>
                            <div class="flex flex-row">
                              <div class="paymentAmt" class="font-bold text-xl mb-2">${paymentAmount} ETH</div>
                            </div>
                            
                          </div>
                          <div class="">
                            <div class="font-bold text-sm mb-2">Next payment</div>
                            <div class="flex flex-row">
                              <div class="nextPayment" class="font-bold text-xl mb-2">
                                ${nextPayment}
                              </div>
                              
                            </div>
                            
                          </div>
                          <div class="">
                            <div class="font-bold text-sm mb-2">Time between payments</div>
                            <div class="flex flex-row">
                              <div class="recur" class="font-bold text-xl mb-2">${recurrance}</div>
                            </div>
                            
                          </div>
                          <div class="">
                            <div class="font-bold text-sm mb-2">Date activated</div>
                            <div class="flex flex-row">
                              <div class="start" class="font-bold text-xl mb-2">${dateActivated}</div>
                            </div>
                            
                          </div>
                        </div>
                        <div class="px-10 py-3">
                          <div class="flex flex-row">
                            <div class="basis-1/4">
                              <div class="font-bold text-sm mb-2">Balance</div>
                              <div class="balance" class="font-bold text-xl mb-2">${balance} ETH</div>
                            </div>
                            <div class="space-y-2">
                            <div class="flex flex-none basis-3/4">
                              <div class="flex justify-center items-center m-auto basis-2/5">
                                <button id="addButton" class="bg-green-500 hover:bg-green-700 px-3 py-1 text-sm font-semibold text-white rounded-full " onclick="addButtonClick('${receiverAcct}')">
                                    Add
                              </div>
                              <div class="flex items-center basis-2/5">
                                <input
                                  id="addAmount"
                                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                  type="text"
                                  placeholder="0 ETH"
                                />
                              </div>
                            </div>
                            <div class="flex flex-none basis-3/4">
                              <div class="flex justify-center items-center m-auto basis-2/5">
                                <button id="withdrawButton" class="bg-orange-500 hover:bg-orange-700 px-3 py-1 text-sm font-semibold text-white rounded-full" onclick="withdrawButtonClick('${receiverAcct}')">
                                  Withdraw
                              </div>
                              <div class="flex items-center basis-2/5">
                                <input
                                  id="withdrawAmount"
                                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                  type="text"
                                  placeholder="0 ETH"
                                />
                              </div>
                            </div>

                            <div>
                          </div>
                        </div>
                      </div>
    `;
}

// all inputs strings which we add to the html using ${}
async function addNewSubCardOutgoing(
  receiverAcct,
  paymentAmount,
  nextPayment,
  recurrance,
  dateActivated,
  escrow
) {
  document.getElementById(
    "subsContainer"
  ).innerHTML += `<div id="subCard" class="rounded-xl overflow-hidden shadow-lg bg-gray-300">
                        <div class="px-6 py-4">
                          <div class="flex flex-row">
                            <div id="subTo" class="font-bold text-xl mb-2 basis-3/4">${receiverAcct}</div>
                          </div>
                          
                        </div>
                        <div class="px-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
                          <div class="">
                            <div class="font-bold text-sm mb-2">
                              Payment Amount
                            </div>
                            <div class="flex flex-row">
                              <div class="paymentAmt" class="font-bold text-xl mb-2">${paymentAmount} ETH</div>
                            </div>
                            
                          </div>
                          <div class="">
                            <div class="font-bold text-sm mb-2">Next payment</div>
                            <div class="flex flex-row">
                              <div class="nextPayment" class="font-bold text-xl mb-2">
                                ${nextPayment}
                              </div>
                              
                            </div>
                            
                          </div>
                          <div class="">
                            <div class="font-bold text-sm mb-2">Time between payments</div>
                            <div class="flex flex-row">
                              <div class="recur" class="font-bold text-xl mb-2">${recurrance}</div>
                            </div>
                            
                          </div>
                          <div class="">
                            <div class="font-bold text-sm mb-2">Date activated</div>
                            <div class="flex flex-row">
                              <div class="start" class="font-bold text-xl mb-2">${dateActivated}</div>
                            </div>
                            
                          </div>
                        </div>
                        <div class="px-10 py-3">
                          <div class="flex flex-row">
                            <div class="basis-1/3">
                              <div class="font-bold text-sm mb-2">Balance</div>
                              <div class="balance" class="font-bold text-xl mb-2">${balance} ETH</div>
                            </div>
                            <div class="flex justify-center items-center  basis-2/3">
                              <div class="space-x-4">
                                <button class="bg-orange-500 hover:bg-orange-700 basis-1/2 px-3 py-1 text-sm font-semibold text-white rounded-full">
                                  Collect
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
    `;
}

load();
