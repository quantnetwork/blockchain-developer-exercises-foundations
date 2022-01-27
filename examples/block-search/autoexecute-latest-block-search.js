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

log.info("Loading password passed in via the command line");
const PASSWORD_INPUT = process.argv.slice(2).toString();
const SENV_PASSWORD = PASSWORD_INPUT.split("=")[1];

// Check for provided password
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/block-search/autoexecute-latest-block-search.js password=MY_PASSWORD",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/block-search/autoexecute-latest-block-search.js password=MY_PASSWORD",
  );
}

//if password provided continue
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

    log.info("Creating Overledger Request Object with the Correct Location");
    const overledgerRequestMetaData = {
      location: {
        technology: "Bitcoin",
        network: "Testnet",
      },
    };
    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );

    log.info("Sending a Request to Overledger for the Latest Block");
    const overledgerResponse = await overledgerInstance.post(
      "/autoexecution/search/block/latest",
      overledgerRequestMetaData,
    );

    log.info(`Printing Out Overledger's Response:\n\n`);

    // The preparation object section of the response includes
    // the request id and any QNT fee that must be paid for use of this endpoint 
    // (API calls are free on testnets).
    log.info(
      `preparationBlockSearchResponse: ${JSON.stringify(
        overledgerResponse.data.preparationBlockSearchResponse,
      )}`,
    );

    // The execution object section of the response includes a location, status, and block objects
    log.info(
      `executionBlockSearchResponse (location): ${JSON.stringify(
        overledgerResponse.data.executionBlockSearchResponse.location,
      )}`,
    );
    log.info(
      `executionBlockSearchResponse (status): ${JSON.stringify(
        overledgerResponse.data.executionBlockSearchResponse.status,
      )}`,
    );
    log.info(
      `executionBlockSearchResponse (block): ${JSON.stringify(
        overledgerResponse.data.executionBlockSearchResponse.block,
      )}`,
    );
  } catch (e) {
    log.error("error", e);
  }
})();
