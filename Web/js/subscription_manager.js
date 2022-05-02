const MONTH_LEN = 18144000;
const WEEK_LEN = 604800;
//const subCard = document.getElementById("subCard");
// const subsContainer = document.getElementById("subsContainer");

refreshButton.addEventListener("click", () => {
  console.log("h");
  addNewSubCard("archie", "4.20", "01/01/1010", "1 week", "01/10/2020", "200");
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

async function loadEvents() {
  await loadWeb3();
  window.contract = await loadContract();
  window.contract
    .getPastEvents("SubscriptionData", {
      // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    })
    .then(function (events) {
      console.log(events); // same results as the optional callback above
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
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        loadEvents();
      })
      .catch((error) => {
        console.log(error, error.code);
        //alert(error.code);
      });
  }
  document.getElementById(
    "subsContainer"
  ).innerHTML += `<div id="subCard" class="rounded-xl overflow-hidden shadow-lg bg-gray-300">
                        <div class="px-6 py-4">
                          <div class="flex flex-row">
                            <div id="subTo" class="font-bold text-xl mb-2 basis-3/4">${receiverAcct}</div>
                            <button id="cancelButton" class="bg-red-500 hover:bg-red-700 basis-1/4  px-3 py-1 text-sm font-semibold text-white rounded-full">
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
                            <div class="basis-1/3">
                              <div class="font-bold text-sm mb-2">Balance</div>
                              <div class="balance" class="font-bold text-xl mb-2">${balance} ETH</div>
                            </div>
                            <div class="flex justify-center items-center  basis-2/3">
                              <div class="space-x-4">
                                <button class="bg-green-500 hover:bg-green-700 basis-1/2 px-3 py-1 text-sm font-semibold text-white rounded-full">
                                  Add
                                <button class="bg-orange-500 hover:bg-orange-700 basis-1/2 px-3 py-1 text-sm font-semibold text-white rounded-full">
                                  Withdraw
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
    `;
  //   var newSubCard = subCard.cloneNode(true);
  //   newSubCard.id = "";
  //   let currentDate = new Date();
  //   let nextDate = new Date();
  //   let recurStr = "";
  //   let recurVal = recurrance;

  //   nextDate.setSeconds(currentDate.getSeconds() + recurrance);
  //   if (recurVal >= MONTH_LEN) {
  //     recurStr += ~~(recurVal / MONTH_LEN) + " month";
  //     if (recurVal >= MONTH_LEN * 2) {
  //       recurStr += "s";
  //     }
  //     recurVal = recurVal % MONTH_LEN;
  //     recurStr += " ";
  //   }
  //   if (recurVal >= WEEK_LEN) {
  //     recurStr += ~~(recurVal / WEEK_LEN) + " week";
  //     if (recurVal >= WEEK_LEN * 3) {
  //       recurStr += "s";
  //     }
  //     recurVal = recurVal % WEEK_LEN;
  //     recurStr += " ";
  //   }
  //   recurStr += recurVal + " seconds";

  //   newSubCard.getElementsByClassName("subTo")[0].innerHTML = receiverAcct;
  //   newSubCard.getElementsByClassName("paymentAmt")[0].innerHTML =
  //     "" + payment_amount + " ETH";
  //   newSubCard.getElementsByClassName("start")[0].innerHTML =
  //     "<b>" +
  //     // currentDate.getDate() +
  //     "/" +
  //     // currentDate.getMonth() +
  //     1 +
  //     "/" +
  //     // currentDate.getFullYear() +
  //     "</b>";
  //   newSubCard.getElementsByClassName("nextPayment")[0].innerHTML =
  //     "<b>" +
  //     // nextDate.getDate() +
  //     "/" +
  //     // nextDate.getMonth() +
  //     1 +
  //     "/" +
  //     // nextDate.getFullYear() +
  //     "</b>";
  //   //   newSubCard.getElementsByClassName("recur")[0].innerHTML = recurStr;
  //   newSubCard.getElementsByClassName("recur")[0].innerHTML = "recurStr";
  //   newSubCard.getElementsByClassName("balance")[0].innerHTML =
  //     "" + init_val + " ETH";

  //   subsContainer.appendChild(newSubCard);
}
