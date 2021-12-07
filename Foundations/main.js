import dotenv from "dotenv";
import path from "path";
import log4js from "log4js";
import secureEnv from 'secure-env';
import OverledgerBundle from '@quantnetwork/overledger-bundle';
import OverledgerTypes from '@quantnetwork/overledger-types';
const dltOptions = OverledgerTypes.DltNameOptions;
const OverledgerSDK = OverledgerBundle.default;

const log = log4js.getLogger("main");
log4js.configure({
    appenders: {
      console: { type: "console" },
    },
    categories: {
      default: { appenders: ["console"], level: "debug" },
    },
  });
dotenv.config();
const WALLET_NAME = process.env.WALLET_NAME;
const WALLET_APPLICATION = process.env.WALLET_APPLICATION;
const MDAPP_ID = process.env.MDAPP_ID;
const MDAPP_KEY = process.env.MDAPP_KEY;

log.info("Starting demo using mdapp: ", MDAPP_ID);

// create account
(async () => {
  try {
      const overledger = new OverledgerSDK({
          dlts: [{ dlt: dltOptions.BITCOIN },
          { dlt: dltOptions.ETHEREUM },
          { dlt: dltOptions.XRP_LEDGER }
          ],
          provider: { network: 'testnet' },
          envFilePassword: 'PASSWORD_HERE',
      });
      
      const bitcoinAccount = await overledger.dlts.bitcoin.createAccount();
      console.log('Bitcoin account:\n', bitcoinAccount);
      console.log("");

      const ethAccount = await overledger.dlts.ethereum.createAccount();
      console.log('Ethereum account:\n', ethAccount);
      console.log("");

      const xrpAccount = await overledger.dlts["xrp-ledger"].createAccount();
      console.log('XRP ledger account:\n', xrpAccount);
      console.log("");
  } catch (e) {
      console.error('error', e);
  }
})();
