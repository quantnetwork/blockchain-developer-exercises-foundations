//NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const OverledgerSDK = require('@quantnetwork/overledger-bundle').default;
const DltNameOptions = require('@quantnetwork/overledger-types').DltNameOptions;

; (async () => {
    try {
        //Step 1: Configure SDK
        const overledger = new OverledgerSDK({
            dlts: [{ dlt: DltNameOptions.BITCOIN },
            { dlt: DltNameOptions.ETHEREUM },
            { dlt: DltNameOptions.XRP_LEDGER }], //connects OVL to these 3 technologies
            userPoolID: 'us-east-1_xfjNg5Nv9', //where your userpool id is be located
            provider: { network: 'https://api.sandbox.overledger.io/v2' }, //URL for the testnet versions of these DLTs
            envFilePassword: 'password', //the password to access the .env.enc file. add your own password here
        });

        //Step 2: Get Required Tokens
        const refreshTokensResponse = await overledger.getTokensUsingClientIdAndSecret(process.env.USER_NAME, process.env.PASSWORD,
            process.env.CLIENT_ID, process.env.CLIENT_SECRET);

        //Step 3: Create Request Object with Correct Location
        const overledgerRequestMetaData = {
            "location": {
                "technology": "Bitcoin",
                "network": "Testnet"
            }
        }
        const overledgerInstance = overledger.provider.createRequest(refreshTokensResponse.accessToken.toString());

        //Step 4: Send Request to Overledger for the Latest Block
        const overledgerResponse = await overledgerInstance.post("/autoexecution/search/block/latest",overledgerRequestMetaData);

        //Step 5: Print Response
        console.log("\n\nOverledgerResponse:\n\n" + JSON.stringify(overledgerResponse.data));

    } catch (e) {
        console.error('error', e);
    }
})();

