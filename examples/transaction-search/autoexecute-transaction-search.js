//NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "transaction-search";
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
const SENV_PASSWORD = PASSWORD_INPUT.split("=")[1];

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

    log.info("Initialize the SDK");
    const overledger = new OverledgerSDK({
      dlts: [{ dlt: DltNameOptions.BITCOIN },
        { dlt: DltNameOptions.ETHEREUM },
        { dlt: DltNameOptions.XRP_LEDGER }], //connects OVL to these 3 technologies
      userPoolID: "us-east-1_xfjNg5Nv9", //where your userpool id is located
      provider: { network: "https://api.sandbox.overledger.io/" }, //URL for the testnet versions of these DLTs
      envFilePassword: SENV_PASSWORD,
    });

    log.info("Obtain Access Token to interact with Overledger");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );
      
      log.info("Create Overledger Request Object with Correct Location");
      const overledgerRequestMetaData = {
        "location": {
            "technology": "Bitcoin",
            "network": "Testnet"
        }
      }
      const overledgerInstance = overledger.provider.createRequest(refreshTokensResponse.accessToken.toString());

      log.info("Locate the latest Payment Transaction on the Blockchain");
        let locatedPaymentTransaction = false;
        let numberOfTransactionsInBlock;
        let transactionsInBlockCounter;
        let previousBlock;
        let transactionId;
        let overledgerTransactionResponse;
        let overledgerBlockResponse;
        let blockToSearch = "latest";

        while (locatedPaymentTransaction == false){

            log.info("Asking Overledger for Block: " + blockToSearch);
            overledgerBlockResponse = await overledgerInstance.post("/autoexecution/search/block/" + blockToSearch,overledgerRequestMetaData);

            transactionsInBlockCounter = overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions-1;
            log.info("Transactions in Block = " + overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions);
                //check if there is any transactions in this block
            while (transactionsInBlockCounter == 0){
                    //if there is no transactions then ...
                log.info("Block number " +  overledgerBlockResponse.data.executionBlockSearchResponse.block.blockNumber + "does not have any transactions");
                log.info("Therefore searching for previous block...");
                previousBlock = overledgerBlockResponse.data.executionBlockSearchResponse.block.number-1;
                overledgerBlockResponse = await overledgerInstance.post("/autoexecution/search/block/"+previousBlock,overledgerRequestMetaData);
                transactionsInBlockCounter = overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions-1;               
            }
            log.info("Block number " +  overledgerBlockResponse.data.executionBlockSearchResponse.block.blockNumber + "includes transactions");
              //start from the last transaction of the block (as blockchains process from transaction 1 of the block to transaction n)
            log.info("Payment Transaction Search Will Start From Transaction Number: " + transactionsInBlockCounter);

            while (transactionsInBlockCounter < numberOfTransactionsInBlock){
                    //get n'th transaction id
                transactionId = overledgerBlockResponse.data.executionBlockSearchResponse.transactionIds[transactionsInBlockCounter];
                    //query Overledger for this transaction
                overledgerTransactionResponse = await overledgerInstance.post("/autoexecution/search/transaction?transactionId=" + transactionId,overledgerRequest);
                if (overledgerTransactionResponse.data.executionTransactionSearchResponse.type == "PAYMENT"){
                    transactionsInBlockCounter = numberOfTransactionsInBlock;
                    locatedPaymentTransaction = true;
                } else {
                    transactionsInBlockCounter++;
                }
            }

            if (locatedPaymentTransaction == false){
                blockToSearch = overledgerBlockResponse.data.executionBlockSearchResponse.blockNumber;
            }

        }

        console.log("\n\nOverledgerPaymentTransactionResponse: " + JSON.stringify(overledgerTransactionResponse.data));


  } catch (e) {
    log.error("error", e);
  }
})();
