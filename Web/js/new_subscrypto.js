const newSubscrypto = document.getElementById("newSubscrypto");
const MONTH_LEN = 18144000;
const WEEK_LEN = 604800;
const ETH_TO_WEI = 1e18;

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

newSubscrypto.addEventListener("click", () => {
  if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const account = accounts[0];
        const receiverAcct = document.getElementById("receiverWallet").value;
        const payment_amount = BigInt(
          parseFloat(document.getElementById("payment_amount").value) *
            ETH_TO_WEI
        ).toString();
        const init_val = BigInt(
          parseFloat(document.getElementById("init_val").value) * ETH_TO_WEI
        ).toString();
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
load();
