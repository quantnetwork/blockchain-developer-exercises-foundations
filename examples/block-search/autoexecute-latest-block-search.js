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
      dlts: [
        { dlt: DltNameOptions.BITCOIN },
        { dlt: DltNameOptions.ETHEREUM },
        { dlt: DltNameOptions.XRP_LEDGER },
      ], // connects OVL to these 3 technologies
      userPoolID: "us-east-1_xfjNg5Nv9", // where your userpool id is located
      provider: { network: "https://api.sandbox.overledger.io/" }, // URL for the testnet versions of these DLTs
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
      location: {
        technology: "Bitcoin",
        network: "Testnet",
      },
    };
    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );

    log.info("Send Request to Overledger for the Latest Block");
    const overledgerResponse = await overledgerInstance.post(
      "/autoexecution/search/block/latest",
      overledgerRequestMetaData,
    );

    log.info("Print Out Overledger Response");
    console.log(
      `\n\nOverledgerResponse:\n\n${JSON.stringify(overledgerResponse.data)}`,
    );
  } catch (e) {
    log.error("error", e);
  }
})();
