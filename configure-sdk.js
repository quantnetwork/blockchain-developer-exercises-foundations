const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const dltOptions = OverledgerTypes.DltNameOptions;
const OverledgerSDK = OverledgerBundle.default;
const courseModule = "configure-credentials";
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
      dlts: [],
      userPoolID: "us-east-1_xfjNg5Nv9", // your default userpool id
      provider: { network: "https://api.sandbox.overledger.io/" },
      envFilePassword: SENV_PASSWORD,
    });
    log.info("Obtain Access Token to interact with Overledger  ");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );
    log.info("accessToken:\n", refreshTokensResponse.accessToken);
    log.info("refreshToken:\n", refreshTokensResponse.refreshToken);
    log.info("idToken:\n", refreshTokensResponse.idToken);
  } catch (e) {
    log.error("error", e);
  }
})();
