// NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "accounts-state-search";
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
const SENV_PASSWORD = PASSWORD_INPUT.split("=")[1];

// Check for provided password for the secure env
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/state-search/autoexecute-accounts-search.js password=MY_PASSWORD",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/state-search/autoexecute-accounts-search.js password=MY_PASSWORD",
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

    log.info("Obtaining the Access Token to Interact with Overledger");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );

    log.info(
      "Creating the Overledger Request Object with the Correct Location",
    );
    const overledgerRequestMetaData = {
      location: {
        technology: "Ethereum",
        network: "Ropsten Testnet",
      },
    };
    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );

    log.info(
      "Locating the Largest Balance and Sequence Number of any Account Who Sent a Transaction in the Latest Block",
    );
    let transactionId;
    let originId;
    let thisBalance;
    let thisSequence;
    let maxBalance = 0;
    let maxSequence = 0;
    let originIdWithMaxBalance;
    let originIdWithMaxSequence;
    let overledgerTransactionResponse;
    let overledgerAddressBalanceResponse;
    let overledgerAddressSequenceResponse;
    let overledgerAddressMaxBalanceResponse;
    let overledgerAddressMaxSequenceResponse;

    log.info(`Asking Overledger for the latest Block`);
    const overledgerBlockResponse = await overledgerInstance.post(
      `/autoexecution/search/block/latest`,
      overledgerRequestMetaData,
    );
    const transactionsInBlock =
      overledgerBlockResponse.data.executionBlockSearchResponse.block
        .numberOfTransactions - 1;
    const blockNumber =
      overledgerBlockResponse.data.executionBlockSearchResponse.block.number;
    log.info(
      `Transactions in Block = ${overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions}`,
    );

    // check if there is any transactions in this block
    if (transactionsInBlock < 0) {
      log.info(`The latest block has no transactions. Please try again later.`);
    } else {
      let counter = 0;
      while (counter <= transactionsInBlock) {
        // get n'th transaction id
        log.info(
          `Asking Overledger for Transaction ${counter} in Block ${blockNumber}`,
        );
        transactionId =
          overledgerBlockResponse.data.executionBlockSearchResponse.block
            .transactionIds[counter];
        log.info(`The Id of this Transaction is ${transactionId}`);
        // query Overledger for this transaction
        overledgerTransactionResponse = await overledgerInstance.post(
          `/autoexecution/search/transaction?transactionId=${transactionId}`,
          overledgerRequestMetaData,
        );
        originId =
          overledgerTransactionResponse.data.executionTransactionSearchResponse
            .transaction.origin[0].originId;
        log.info(`The originId of this Transaction is ${originId}`);
        // query Overledger for the origin's balance
        overledgerAddressBalanceResponse = await overledgerInstance.post(
          `/autoexecution/search/address/balance/${originId}`,
          overledgerRequestMetaData,
        );
        thisBalance =
          overledgerAddressBalanceResponse.data
            .executionAddressBalanceSearchResponse.balances[0].amount;
        // query Overledger for the origin's sequence
        overledgerAddressSequenceResponse = await overledgerInstance.post(
          `/autoexecution/search/address/sequence/${originId}`,
          overledgerRequestMetaData,
        );
        thisSequence =
          overledgerAddressSequenceResponse.data
            .executionAddressSequenceSearchResponse.sequence;

        // change the maximums if required
        if (thisBalance > maxBalance) {
          maxBalance = thisBalance;
          originIdWithMaxBalance = originId;
          overledgerAddressMaxBalanceResponse =
            overledgerAddressBalanceResponse;
        }
        if (thisSequence > maxSequence) {
          maxSequence = thisSequence;
          originIdWithMaxSequence = originId;
          overledgerAddressMaxSequenceResponse =
            overledgerAddressSequenceResponse;
        }

        counter++;
      }

      const balanceUnit =
        overledgerAddressBalanceResponse.data
          .executionAddressBalanceSearchResponse.balances[0].unit;
      log.info();
      log.info(`In Block ${blockNumber}:`);
      log.info(
        `The Address with the Largest Balance is: ${originIdWithMaxBalance}`,
      );
      log.info(`This Address had a Balance of: ${maxBalance} ${balanceUnit}`);
      log.info(
        `The Address with the Largest Sequence is: ${originIdWithMaxSequence}`,
      );
      log.info(`This Address had a Sequence Number of: ${maxSequence}`);

      log.info(
        `Overledger's Response For the Max Balance Was:\n\n${JSON.stringify(
          overledgerAddressMaxBalanceResponse.data,
        )}\n\n`,
      );

      log.info(
        `Overledger's Response For the Max Sequence Was:\n\n${JSON.stringify(
          overledgerAddressMaxSequenceResponse.data,
        )}\n\n`,
      );
    }
  } catch (e) {
    log.error("error", e);
  }
})();
