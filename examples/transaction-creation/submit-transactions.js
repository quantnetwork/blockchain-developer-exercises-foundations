// NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "latest-block-search";
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

log.info("Loading secure environment variables defined in .env.enc");
const PASSWORD_INPUT = process.argv.slice(2).toString();
const SENV_PASSWORD = PASSWORD_INPUT.split("=")[1].split(" ")[0];
const BITCOIN_FUNDING_TX = BITCOIN_FUNDING_TX_INPUT.split("=")[2];

// Check for provided password for the secure env
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/transaction-creation/submit-transaction.js password=MY_PASSWORD bitcoinTx=7f39571159935d849d1d7407754157921450c5252f1c79cced14ad56d3fdb3e4",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/transaction-creation/submit-transaction.js password=MY_PASSWORD bitcoinTx=7f39571159935d849d1d7407754157921450c5252f1c79cced14ad56d3fdb3e4",
  );
}
// Check for provided bitcoin funding transaction
if (!BITCOIN_FUNDING_TX) {
    log.error(
      "Please insert a bitcoin funding transaction for your address. Example: \n node generate-credentials.js password=MY_PASSWORD",
    );
    throw new Error(
      "Please insert a password to decrypt the secure env file. Example: \n node generate-credentials.js password=MY_PASSWORD",
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
    log.info("Creating random addresses to send transactions too");
    const bitcoinAccount = await overledger.dlts.bitcoin.createAccount();
    const bitcoinDestination = bitcoinAccount.address;

    const ethAccount = await overledger.dlts.ethereum.createAccount();
    const ethereumDestination = ethAccount.address;

    const xrpAccount = await overledger.dlts["xrp-ledger"].createAccount();
    const xrpLedgerDestination = xrpAccount.address;

    log.info("Setting our private key from the encrypted .env file");
    // this function is client side only (i.e. there is no interaction with the Overledger DLT gateway calling this function)
    overledger.dlts[DltNameOptions.BITCOIN].setAccount({privateKey: process.env.BITCOIN_PRIVATE_KEY});
    overledger.dlts[DltNameOptions.ETHEREUM].setAccount({privateKey: process.env.ETHEREUM_PRIVATE_KEY});
    overledger.dlts[DltNameOptions.XRP_LEDGER].setAccount({privateKey: process.env.XRP_LEDGER_PRIVATE_KEY});

    log.info("Obtaining the Access Token to Interact with Overledger");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );

    log.info("Creating Overledger Request Object with the Correct Location");
    const overledgerRequestMetaData = [{
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
    }];

    const overledgerInstance = overledger.provider.createRequest(
        refreshTokensResponse.accessToken.toString(),
      );

    log.info("Creating the Correct Transaction Origins");

    const overledgerTransactionSearchResponse = await overledgerInstance.post(
        `/autoexecution/search/transaction?transactionId=${BITCOIN_FUNDING_TX}`,
        overledgerRequestMetaData[0],
      );
    //loop over UTXOs and wait for a match to the users Bitcoin address
    const bitcoinAddress = process.env.BITCOIN_ADDRESS;
    let count = 0;
    const destinations = overledgerTransactionSearchResponse.data.transaction.destination.length;
    let destination;
    let bitcoinOrigin;
    while (count < destinations){
        destination = overledgerTransactionSearchResponse.data.transaction.destination[count];
        if (destination.destinationId == bitcoinAddress){
            bitcoinOrigin = BITCOIN_FUNDING_TX + ":" + count.toString();
        }
        count++;
    }

    const overledgerOrigins = [
        "mmLuhHniRM79mdpN9TZzTje4kiKL2pqWvT",
        "0x99B1D2ee55FbADedC48BDA5B0cFb9e21634b7af8",
        process.env.XRP_LEDGER_ADDRESS,
    ];

    const overledgerDestinations = [
        bitcoinDestination,
        ethereumDestination,
        xrpLedgerDestination
    ];

    //we will send the minimal amounts of each DLT
    const overledgerAmounts = [
        "0.0000001",
        "0.000000000000000001",
        "0.000001"
    ]
    const overledgerUnits = [
        "BTC",
        "ETH",
        "XRP"
    ]
    log.info(`Transaction Origins = ${JSON.stringify(overledgerOrigins)}`); 

    log.info("Loop to prepare, sign and send transactions for each DLT");

    count = 0;
    let signedTransaction;
    let prepareTransactionRequest = [];
    let prepareTransactionResponse = [];
    let executeTransactionRequest = [];
    let executeTransactionResponse = [];
    while (count < overledgerRequestMetaData.length){

        //format the transaction request
        prepareTransactionRequest[count] = 
        {
            "type": "payment",
            "location": {
                "technology": overledgerRequestMetaData[count].location.technology,
                "network": overledgerRequestMetaData[count].location.network
            },
            "urgency": "normal",
            "requestDetails": {
                "overledgerSigningType": "overledger-javascript-library",
                "message": "OVL Message Example",
                "origin": [
                    {
                        "originId": overledgerOrigins[count],
                    }
                ],
                "destination": [
                    {
                        "destinationId": overledgerDestinations[count],
                        "payment": {
                            "amount": overledgerAmounts[count],
                            "unit": overledgerUnits[count]
                        }
                    }            
                ]
            }
        }
        //send the standardised transaction to Overledger to prepare the native data stucture
        prepareTransactionResponse[count] = await overledgerInstance.post(
            "/preparation/transaction",
            prepareTransactionRequest[count],
          ).data;
        //sign the native transaction
        signedTransaction = (await overledger.sign(overledgerRequestMetaData[count].location.technology.toLowerCase(), prepareTransactionResponse[count])).signedTransaction;
        executeTransactionRequest[count] = {
            requestId: prepareTransactionResponse[count].requestId,
            signed: signedTransaction
        }
        //submit the signed transaction to Overledger
        executeTransactionResponse[count] = await overledgerInstance.post(
            "/execution/transaction",
            executeTransactionRequest[count],
          ).data;
        count++;
    }




    log.info("Sending a Request to Overledger for the Latest Block");
    const overledgerResponse = await overledgerInstance.post(
      "/autoexecution/search/block/latest",
      overledgerRequestMetaData,
    );

    log.info(
      `Printing Out Overledger's Response:\n\n${JSON.stringify(overledgerResponse.data)}\n\n`,
    );
  } catch (e) {
    log.error("error", e);
  }
})();
