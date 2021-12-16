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
    "Please insert a password to decrypt the secure env file. Example: \n node generate-credentials.js password=MY_PASSWORD",
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
        bitcoinOrigin,
        process.env.ETHEREUM_ADDRESS,
        process.env.XRP_LEDGER_ADDRESS,
    ]
    log.info(`Transaction Origins = ${JSON.stringify(overledgerOrigins)}`); 

    log.info("Loop to prepare, sign and send transactions for each DLT");

    {
        "type": "payment",
        "location": {
            "technology": "Bitcoin",
            "network": "Testnet"
        },
        "urgency": "normal",
        "requestDetails": {
            "overledgerSigningType": "overledger-javascript-library",
            "message": "OVL Transaction Message",
            "origin": [
                {
                    "originId": "1f75f6d6613a2e27d3e5e6cccde8b13e5a84f332740e540fbabcf2be6e8ccc43:0",
                    "sequence": "1"
                }
            ],
            "destination": [
                {
                    "destinationId": "2NBMEXVyNG7MoZ25qmPrRhC28sgPRgGN36d",
                    "payment": {
                        "amount": "0.01",
                        "unit": "BTC"
                    }
                }            
            ]
        }
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
