const OverledgerSDK = require("@quantnetwork/overledger-bundle").default;
const { DltNameOptions } = require("@quantnetwork/overledger-types");
const log4js = require("log4js");

const courseModule = "generate-accounts";
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

log.info("Initializing the SDK");
(async () => {
  try {
    const overledger = new OverledgerSDK({
      dlts: [
        { dlt: DltNameOptions.BITCOIN },
        { dlt: DltNameOptions.ETHEREUM },
        { dlt: DltNameOptions.XRP_LEDGER },
      ],
      provider: { network: "testnet" },
    });

    log.info("Creating the Accounts");
    const bitcoinAccount = await overledger.dlts.bitcoin.createAccount();
    log.info(`BitcoinAccount =\n${JSON.stringify(bitcoinAccount)}\n`);

    const ethAccount = await overledger.dlts.ethereum.createAccount();
    log.info(`EthereumAccount =\n${JSON.stringify(ethAccount)}\n`);

    const xrpAccount = await overledger.dlts["xrp-ledger"].createAccount();
    log.info(`XRPLedgerAccount =\n${JSON.stringify(xrpAccount)}\n`);
  } catch (e) {
    log.error("error", e);
  }
})();
