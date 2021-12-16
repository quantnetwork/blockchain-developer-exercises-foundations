# Week 3 Cryptography in Distributed Ledger Technologies

## Exercise 3.10 - Create your first DLT transactions

For this task, we will create our transactions via Overledger’s prepareTransactionRequest and executePreparedRequestTransaction APIs. The openAPI3 version of these endpoints can be found [here](https://docs.overledger.io/#operation/prepareTransactionRequest) and [here](https://docs.overledger.io/#operation/executePreparedRequestTransaction). 


### DLT Network Information

We will be interacting with the Bitcoin, Ethereum & XRP Ledger testnets. The relevant Overledger location objects are as follows:

1. Location = {“technology”: “Bitcoin”, “network”: “Testnet”}
2. Location = {“technology”: “Ethereum”, “network”: “Ropsten Testnet”}
3. Location = {“technology”: “XRP Ledger”, “network”: “Testnet”}

### Prerequisites

It is assumed that you have already setup your environment by following [these instructions](./CLASS1.md) and that you have completed the previous exercises that use Overledger to read data from the DLT networks.

### Creating Accounts

This example will create and console log new DLT accounts for all of the Bitcoin testnet, Ethereum Ropsten testnet and the XRP ledger test:

`node examples/account-creation/generate-accounts.js`

**NOTE that key pairs can be reused on different DLT networks including mainnets, so we recommend for you to only use these generated accounts for these tutorials.**

**TAKEAWAY: Do not mix the accounts that you use on testnets and mainnets!**

To use them, recall the *.env.example.* from Class 1. This file defines environment variables that our programs will later use. In Class 1, we set the USER_NAME, PASSWORD, CLIENT_ID and CLIENT_SECRET environment variables. In this class we still require those previous four variables but now we will also enter the following: 

- BITCOIN_PRIVATE_KEY: set this equal to your newly generated BitcoinAccount.privateKey
- ETHEREUM_PRIVATE_KEY: set this equal to your newly generated EthereumAccount.privateKey
- XRP_LEDGER_PRIVATE_KEY: set this equal to your newly generated XRPLedgerAccount.privateKey
- BITCOIN_ADDRESS: set this equal to your newly generated BitcoinAccount.address
- ETHEREUM_ADDRESS: set this equal to your newly generated EthereumAccount.address
- XRP_LEDGER_ADDRESS: set this equal to your newly generated XRPLedgerAccount.address

Therefore you will once again need to duplicate the *.env.example* file and rename it to *.env*. Make sure to set the previous four parameters from Class 1 and the new six parameters from this class in *.env*. You will also need to once again encrypt the *.env* file. For this, run on your terminal (replace MY_PASSWORD for a password of your choice):

``npm-run secure-env .env -s MY_PASSWORD``


### Attaining Testnet Cryptocurrency

As we are interacting with permissionless DLT networks, we will have to pay a transaction fee to get our transactions accepted on the DLT networks. As we are interacting with testnets, the transaction fee will actually be paid in a worthless cryptocurrency. But the transaction fee system needs to still be present in the testnets, otherwise the testnets would not accurately simulate the mainnets. 

There you will need to fund your addresses before you can send transactions from those addresses. To fund your addresses on testnets, we can request a faucet to provide us some funds. These services are named as faucets as the "drip" funds to users that require them. 

As we list a few publicly available faucets options below:
- Ethereum Ropsten Testnet: https://faucet.ropsten.be/ or https://faucet.dimensions.network/
- XRP Ledger Testnet: https://xrpl.org/xrp-testnet-faucet.html
- Bitcoin Testnet: https://bitcoinfaucet.uo1.net/ or https://coinfaucet.eu/en/btc-testnet/ or https://testnet-faucet.mempool.co/ 

Note that faucets can be occasionally empty or can change frequently, if your having trouble with all of the ones listed above for your desired DLT, have a Google and let us know if you find a better one.

### 

See that the response has two main objects due to Overledger’s preparation and execution model:

1. preparationAddressBalanceSearchResponse: This includes the request id and any QNT fee that must be paid for use of this endpoint.
2. executionAddressBalanceSearchResponse: This includes the requested address balance. 

The balance information will be returned in cross-DLT standardised form for the account data model. There is no associated status object as balances are read from the state of the latest block.

For parameter by parameter descriptions see the [openAPI3 doc](https://docs.overledger.io/#operation/autoExecuteSearchAddressBalanceRequest).

##### Overledger Auto Execute Balance Search API Response

See that the response has two main objects due to Overledger’s preparation and execution model:

1. preparationAddressSequenceSearchResponse: This includes the request id and any QNT fee that must be paid for use of this endpoint.
2. executionAddressSequenceSearchResponse: This includes the requested address sequence. 

The sequence information will be returned in cross-DLT standardised form for the account data model. There is no associated status object as balances are read from the state of the latest block.

For parameter by parameter descriptions see the [openAPI3 doc](https://docs.overledger.io/#operation/prepareAddressSequenceSearchRequest_1).

#### Challenges

##### Searching the XRP Ledger Testnet

Given the example `./examples/state-search/autoexecute-accounts-search.js` file and the location information listed above, can you understand how to change this file to instead run for the XRP Ledger testnets?

##### Searching for a Specific Address

Take a look at a third party explorer for the DLT testnets we are using, e.g. [the Ethereum Ropsten Testnet](https://ropsten.etherscan.io/) or [the XRP Ledger Testnet](https://blockexplorer.one/xrp/testnet).

Choose any account address from these explorers. Can you understand how to modify the example script to search for that account's balance and sequence?

#### Troubleshooting
This class was tested in  Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

``Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt``

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

