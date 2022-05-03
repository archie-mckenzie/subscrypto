const MONTH_LEN = 2592000;
const WEEK_LEN = 604800;
const ETH_TO_WEI = 1e18;
//const subCard = document.getElementById("subCard");
// const subsContainer = document.getElementById("subsContainer");

refreshButton.addEventListener("click", () => {
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


async function loadEvents(account) {
  document.getElementById("subsContainer").innerHTML = "";
  window.contract
    .getPastEvents("SubscriptionData", {
      filter: { receiver: account },
      // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    })
    .then(function (events) {
      //console.log(events); // same results as the optional callback above
      for (const [key, value] of Object.entries(events)) {
        console.log(value.returnValues);
        const returnDict = value.returnValues;
        const fromStr =
          "From: " +
          returnDict["sender"].substr(0, 8) +
          "..." +
          returnDict["sender"].substr(returnDict["sender"].length - 4);

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

        // find last payment date
        let currentSecs = new Date().getTime() / 1000;
        let lastPaymentNum = ~~((currentSecs - timeActivated) / recurrance);
        let lastPaymentInSecs = timeActivated + lastPaymentNum * recurrance;
        let lastDate = new Date(lastPaymentInSecs * 1000);
        //console.log("nPIS" + nextPaymentInSecs);
        let month1 = lastDate.getMonth() + 1;
        const lastPayment =
          month1 + "/" + lastDate.getDate() + "/" + lastDate.getFullYear();

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
          fromStr,
          paymentAmount,
          lastPayment,
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
  lastPayment,
  recurrance,
  dateActivated,
  balance
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
                            <div class="font-bold text-sm mb-2">Last payment</div>
                            <div class="flex flex-row">
                              <div class="nextPayment" class="font-bold text-xl mb-2">
                                ${lastPayment}
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
                              <div class="Available funds" class="font-bold text-xl mb-2">${balance} ETH</div>
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
