const connectButton = document.getElementById("connectButton");
const newSubscrypto = document.getElementById("newSubscrypto");
const subsContainer = document.getElementById("subsContainer");
const walletID = document.getElementById("walletID");
const installAlert = document.getElementById("installAlert");
const mobileDeviceWarning = document.getElementById("mobileDeviceWarning");
//const subCard = document.getElementById("subCard");

const MONTH_LEN = 18144000;
const WEEK_LEN = 604800;

const startLoading = () => {
  connectButton.classList.add("loadingButton");
};

const stopLoading = () => {
  const timeout = setTimeout(() => {
    connectButton.classList.remove("loadingButton");
    clearTimeout(timeout);
  }, 300);
};

const isMobile = () => {
  let check = false;

  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);

  return check;
};

async function addNewSubCard (receiverAcct, payment_amount, recurrance, init_val) {
  var newSubCard = subCard.cloneNode(true);
  newSubCard.id = "";
  let currentDate = new Date();
  let nextDate = new Date();
  let recurStr = "";
  let recurVal = recurrance;

  nextDate.setSeconds(currentDate.getSeconds() + recurrance);
  if (recurVal >= MONTH_LEN){
    recurStr += ~~(recurVal/MONTH_LEN) + " month";
    if (recurVal >= MONTH_LEN*2) {
      recurStr += "s";
    }
    recurVal = recurVal%MONTH_LEN;
    recurStr += " ";
  } 
  if (recurVal >= WEEK_LEN) {
    recurStr += ~~(recurVal/WEEK_LEN) + " week"
    if (recurVal >= WEEK_LEN*3) {
     recurStr += "s";
    }
    recurVal = recurVal%WEEK_LEN;
    recurStr += " ";
  }
  recurStr += recurVal + " seconds";

  newSubCard.getElementsByClassName("subTo")[0].innerHTML = receiverAcct;
  newSubCard.getElementsByClassName("paymentAmt")[0].innerHTML = "" + payment_amount + " ETH";
  newSubCard.getElementsByClassName("start")[0].innerHTML = "<b>" + currentDate.getDate() + "/" + currentDate.getMonth()+1 + "/" + currentDate.getFullYear() + "</b>";
  newSubCard.getElementsByClassName("nextPayment")[0].innerHTML = "<b>" + nextDate.getDate() + "/" + nextDate.getMonth()+1 + "/" + nextDate.getFullYear() + "</b>";
  newSubCard.getElementsByClassName("recur")[0].innerHTML = recurStr;
  newSubCard.getElementsByClassName("balance")[0].innerHTML = "" + init_val + " ETH";
  
  subsContainer.appendChild(newSubCard);  
}

async function createNewSubscrypto(
  receiverAcct,
  payment_amount,
  recurrance,
  account,
  init_val
) {
  await window.contract.methods
    .newSubscription(receiverAcct, payment_amount, recurrance)
    .send({ from: account, value: init_val });
}

connectButton.addEventListener("click", () => {
  if (typeof window.ethereum !== "undefined") {
    startLoading();

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const account = accounts[0];

        walletID.innerHTML = `<span>${account.substr(0, 6)}...${account.substr(
          account.length - 4
        )}</span>`;
        connectButton.style.visibility = "hidden";

        stopLoading();
      })
      .catch((error) => {
        console.log(error, error.code);

        //alert(error.code);
        stopLoading();
      });
  } else {
    if (isMobile()) {
      mobileDeviceWarning.classList.add("show");
    } else {
      window.open("https://metamask.io/download/", "_blank");
      installAlert.classList.add("show");
    }
  }
});

newSubscrypto.addEventListener("click", () => {
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const account = accounts[0];
        const receiverAcct = document.getElementById("receiverWallet").value;
        const payment_amount = parseFloat(
          document.getElementById("payment_amount").value
        );
        const init_val = parseFloat(document.getElementById("init_val").value);
        const secs = parseInt(document.getElementById("secs").value);
        const weeks = parseInt(document.getElementById("weeks").value);
        const months = parseInt(document.getElementById("months").value);
        const recurrance = secs + weeks * WEEK_LEN + months * MONTH_LEN;
        //console.log(recurrance);

        createNewSubscrypto(
          receiverAcct,
          payment_amount,
          recurrance,
          account,
          init_val
        );

        // addNewSubCard(
        //   receiverAcct,
        //   payment_amount,
        //   recurrance,
        //   init_val
        // );
      })
      .catch((error) => {
        console.log(error, error.code);
        //alert(error.code);
      });
  } else {
    if (isMobile()) {
      mobileDeviceWarning.classList.add("show");
    } else {
      window.open("https://metamask.io/download/", "_blank");
      installAlert.classList.add("show");
    }
  }
});

// reloadButton.addEventListener("click", () => {
//   window.location.reload();
// });

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
}



// async function printCoolNumber() {
//     updateStatus('fetching Cool Number...');
//     const coolStatement = await window.contract.methods.getStatements().call();
//     console.log(coolStatement)
//     updateStatus(`coolNumber: ${coolStatement}`);
// }

// async function getCurrentAccount() {
//     const accounts = await window.web3.eth.getAccounts();
//     return accounts[0];
// }

// async function changeCoolNumber() {
//     const value = "World"
//     updateStatus(`Updating coolNumber with ${value}`);
//     const account = await getCurrentAccount();
//     const coolNumber = await window.contract.methods.appendStatement(value).send({ from: account });
//     updateStatus('Updated.');
// }

// function updateStatus(status) {
//     const statusEl = document.getElementById('status');
//     statusEl.innerHTML = status;
//     console.log(status);
// }
