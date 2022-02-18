// NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "submit-transaction";
const { DltNameOptions } = OverledgerTypes;

const log = log4js.getLogger(courseModule);

// Initialize log
log4js.configure({
  appenders: {
    console: { type: "console" },
  },
  categories: {
    default: { appenders: ["console"], level: "debug" },
  },
});

log.info("Loading password passed in via the command line");
const SENV_PASSWORD = process.argv[2].split("=")[1];
const BITCOIN_FUNDING_TX = process.argv[3].split("=")[1];

// Check for provided password for the secure env
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/transaction-creation/submit-transaction.js password=MY_PASSWORD bitcoinTx=MY_BITCOIN_FUNDING_TX",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/transaction-creation/submit-transaction.js password=MY_PASSWORD bitcoinTx=MY_BITCOIN_FUNDING_TX",
  );
}
// Check for provided bitcoin funding transaction
if (!BITCOIN_FUNDING_TX) {
  log.error(
    "Please insert a bitcoin funding transaction for your address. Example: \n node examples/transaction-creation/submit-transaction.js password=MY_PASSWORD bitcoinTx=MY_BITCOIN_FUNDING_TX",
  );
  throw new Error(
    "Please insert a bitcoin funding transaction for your address. Example: \n node examples/transaction-creation/submit-transaction.js password=MY_PASSWORD bitcoinTx=MY_BITCOIN_FUNDING_TX",
  );
}

log.info("Executing ", courseModule);
(async () => {
  try {
    log.info("Initializing the SDK");
    const overledger = new OverledgerSDK({
      dlts: [
        { dlt: DltNameOptions.BITCOIN },
        { dlt: DltNameOptions.ETHEREUM },
        { dlt: DltNameOptions.XRP_LEDGER },
      ], // connects OVL to these 3 technologies
      userPoolID: "us-east-1_xfjNg5Nv9", // where your userpool id is located
      provider: { network: "https://api.sandbox.overledger.io/v2" }, // URL for the testnet versions of these DLTs
      envFilePassword: SENV_PASSWORD,
    });
    log.info("Creating random addresses to send transactions to");
    const bitcoinAccount = await overledger.dlts.bitcoin.createAccount();
    const bitcoinDestination = bitcoinAccount.address;

    const ethAccount = await overledger.dlts.ethereum.createAccount();
    const ethereumDestination = ethAccount.address;

    const xrpAccount = await overledger.dlts["xrp-ledger"].createAccount();
    const xrpLedgerDestination = xrpAccount.address;

    log.info("Loading our private keys from the encrypted .env file");
    // this function is client side only (i.e. there is no interaction with the Overledger DLT gateway calling this function)
    overledger.dlts[DltNameOptions.BITCOIN].setAccount({
      privateKey: process.env.BITCOIN_PRIVATE_KEY,
    });
    overledger.dlts[DltNameOptions.ETHEREUM].setAccount({
      privateKey: process.env.ETHEREUM_PRIVATE_KEY,
    });
    overledger.dlts[DltNameOptions.XRP_LEDGER].setAccount({
      privateKey: process.env.XRP_LEDGER_PRIVATE_KEY,
    });

    log.info("Obtaining the Access Token to Interact with Overledger");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );

    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );

    log.info("Creating Overledger Request Object with the Correct Location");
    const overledgerRequestMetaData = [
      {
        location: {
          technology: "Bitcoin",
          network: "Testnet",
        },
      },
      {
        location: {
          technology: "Ethereum",
          network: "Ropsten Testnet",
        },
      },
      {
        location: {
          technology: "XRP Ledger",
          network: "Testnet",
        },
      },
    ];

    log.info(
      "Setting the Correct Transaction Origins, Destinations, Amounts and Units",
    );

    // check the bitcoin funding transaction
    const overledgerTransactionSearchResponse = await overledgerInstance.post(
      `/autoexecution/search/transaction?transactionId=${BITCOIN_FUNDING_TX}`,
      overledgerRequestMetaData[0],
    );
    // loop over UTXOs in the funding transaction and wait for a match to the users Bitcoin address
    let count = 0;
    const bitcoinTxDestinations =
      overledgerTransactionSearchResponse.data
        .executionTransactionSearchResponse.transaction.destination.length;
    let destination;
    let bitcoinOrigin;
    while (count < bitcoinTxDestinations) {
      destination =
        overledgerTransactionSearchResponse.data
          .executionTransactionSearchResponse.transaction.destination[count];
      if (destination.destinationId == process.env.BITCOIN_ADDRESS) {
        bitcoinOrigin = `${BITCOIN_FUNDING_TX}:${count.toString()}`;
      }
      count += 1;
    }

    if (!bitcoinOrigin) {
      log.error(
        "The providing bitcoin funding transaction does not have a transaction output assigned to your Bitcoin address. Please recheck the provided bitcoinTx.",
      );
      throw new Error(
        "The providing bitcoin funding transaction does not have a transaction output assigned to your Bitcoin address. Please recheck the provided bitcoinTx.",
      );
    }

    // Set the origins. Recall that Account based DLT origins are accountIds,
    // whereas UTXO based DLT origins are transactionIds:TransactionOutputIndex (hence the search for the bitcoin origin above)
    const overledgerOrigins = [
      bitcoinOrigin,
      process.env.ETHEREUM_ADDRESS,
      process.env.XRP_LEDGER_ADDRESS,
    ];

    const overledgerDestinations = [
      bitcoinDestination,
      ethereumDestination,
      xrpLedgerDestination,
    ];

    // We will send be sending the safe amounts of each main protocol token (BTC, ETH, XRP) on each DLT network
    // (safe as Bitcoin can require the amount sent to be over a certain level of satoshis)
    // (safe as XRPL requires the amount sent to a new address to be over a certain limit)
    const overledgerAmounts = ["0.00001", "0.0000000000000001", "10"];
    // Note that as we are connected to the testnet DLT networks, these tokens do not have real world value
    const overledgerUnits = ["BTC", "ETH", "XRP"];

    log.info("Entering loop to prepare, sign and send one transaction\n");

    count = 0;
    let prepareTransactionRequest = {};
    const prepareTransactionResponse = {};
    const executeTransactionRequest = [];
    const executeTransactionResponse = [];
    while (count < 3){
      // format the transaction request
      prepareTransactionRequest = {
        type: "PAYMENT",
        location: {
          technology: overledgerRequestMetaData[count].location.technology,
          network: overledgerRequestMetaData[count].location.network,
        },
        urgency: "normal",
        requestDetails: {
          overledgerSigningType: "overledger-javascript-library",
          message: "OVL Message Example",
          origin: [
            {
              originId: overledgerOrigins[count],
            },
          ],
          destination: [
            {
              destinationId: overledgerDestinations[count],
              payment: {
                amount: overledgerAmounts[count],
                unit: overledgerUnits[count],
              },
            },
          ],
        },
      };
      log.info(`Using DLT: ${overledgerRequestMetaData[count].location.technology}\n`);

      log.info(`OVL prepare transaction request:\n\n${JSON.stringify(prepareTransactionRequest)}\n`);
      // send the standardised transaction to Overledger to prepare the native data stucture
      prepareTransactionResponse[count] = await overledgerInstance.post(
        "/preparation/transaction",
        prepareTransactionRequest,
      );

      log.info(
        `OVL prepare request response:\n\n${JSON.stringify(
          prepareTransactionResponse[count].data,
        )}\n`,
      );

      // sign the native transaction
      log.info(`Signing transaction\n`);
      let signedTransactionResponse = await overledger.sign(
        overledgerRequestMetaData[count].location.technology.replace(/\s+/g, '-').toLowerCase(),
        prepareTransactionResponse[count].data,
      );
      executeTransactionRequest[count] = {
        requestId: prepareTransactionResponse[count].data.requestId,
        signed: signedTransactionResponse.signedTransaction,
      };
      log.info(`OVL execute transaction request ${count}:\n\n${JSON.stringify(executeTransactionRequest[count])}\n`);
      // submit the signed transaction to Overledger
      executeTransactionResponse[count] = await overledgerInstance.post(
        "/execution/transaction",
        executeTransactionRequest[count],
      );
      log.info(
        `Printing Out Overledger's Response for a transaction prepared, signed and submitted onto the ${
          overledgerRequestMetaData[count].location.technology
        } testnet:\n\n${JSON.stringify(executeTransactionResponse[count].data)}\n\n`,
      );
      count++;
    }
  } catch (e) {
    log.error("", e);
  }
})();
