# Week 3 Cryptography in Distributed Ledger Technologies

## Exercise - Create your first DLT transactions

For this task, we will create our transactions via Overledger’s prepareTransactionRequest and executePreparedRequestTransaction APIs. The documentation for these endpoints can be found [here](https://docs.overledger.io/#operation/prepareTransactionRequest) and [here](https://docs.overledger.io/#operation/executePreparedRequestTransaction). 


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

Therefore you will once again need to setup the *.env.enc* file as stated in Class 1. In particular, you need to duplicate the *.env.example* file and rename it to *.env*. Make sure to set the previous four parameters from Class 1 and the new six parameters from this class in *.env*. You will also need to once again encrypt the *.env* file. For this, run on your terminal (replace MY_PASSWORD for a password of your choice):

``npm-run secure-env .env -s MY_PASSWORD``


### Attaining Testnet Cryptocurrency

As we are interacting with permissionless DLT networks, we will have to pay a transaction fee to get our transactions accepted on the DLT networks. As we are interacting with testnets, the transaction fee will actually be paid in a test cryptocurrency (typically without monetary value). But the transaction fee system needs to still be present in the testnets, otherwise the testnets would not accurately simulate the mainnets. 

There you will need to fund your addresses before you can send transactions from those addresses. To fund your addresses on testnets, we can request a faucet to provide us some funds. These services are named as faucets as they "drip" funds to users that require them. 

As we list a few publicly available faucets options below:
- Ethereum Ropsten Testnet: https://faucet.ropsten.be/ or https://faucet.dimensions.network/
- XRP Ledger Testnet: https://xrpl.org/xrp-testnet-faucet.html
- Bitcoin Testnet: https://bitcoinfaucet.uo1.net/ or https://coinfaucet.eu/en/btc-testnet/ or https://testnet-faucet.mempool.co/ 

Note that faucets can be occasionally empty or can change frequently, if your having trouble with all of the ones listed above for your desired DLT, have a Google and let us know if you find a better one.

### Creating Transactions

This example will create transactions on the Bitcoin testnet, Ethereum Ropsten testnet and the XRP ledger test:

`node examples/transaction-creation/submit-transactions.js password=MY_PASSWORD fundingTx=MY_BITCOIN_FUNDING_TX`

Note that an extra command line parameter is required, a bitcoin transaction that you have received from the bitcoin faucet, including an unspent transaction output that you have not yet used. 

We will use the bitcoin funding transaction as the starting point to explore. This script does the following: it first fetches the bitcoin funding transaction that you created using the faucet. Then, it loops over UTXOs in the funding transaction and wait for a match to your Bitcoin address. If it doesn't find it, it means that you have provided the wrong Bitcoin address to *.env*, or the provided transaction is not the funding transaction issued by the faucet (or the faucet is not working correctly). 

Then, the script constructs the origin, which is the UTXO's index from the faucet transaction that was directed to our account. That means that UTXO is unspent (unless you have already spent it) and thus it is usable. This origin is now used to create a prepareTransactionRequest. The request is signed and then sent to Overledger. Overledger gateways then issue the transaction against Bitcoin's test ledger. 


#### Overledger Execute Transaction API Response

The execute transaction response will contain a few main components:

1. Location: Each Overledger DLT data response includes a reference to the location (technology, network) of where this data was taken from. This helps with auditing.

2. Status: Overledger responses regarding blocks and transactions come with a status. Due to some DLTs having probabilistic finality of transactions/blocks and other DLTs having deterministic finality of transaction/blocks, the status object is used to indicate to the developer when the requested data is assumed to be final (therefore status.value = “SUCCESSFUL”) or not (therefore status.value=“PENDING”).
   
3. Transaction = The requested transaction data in standardised and nativeData formats.

For parameter by parameter descriptions see the [documentation](https://docs.overledger.io/#operation/executePreparedRequestTransaction).


#### Challenges

(THE FOLLOWING ARE POSSIBLE IDEAS)

##### Sending Transactions to Specific Addresses

Given the example `./examples/transaction-creation/submit-transactions.js` file, can you understand how to change this file to send to specific addresses that you choose from each DLT network? How will you choose these addresses?

##### Sending Transactions for a Specific Amount

Given the example `examples/transaction-creation/submit-transactions.js` file, can you understand how to change this file to send specific amounts of your choosing? Do you have any limitations on the amounts that you choose and how can you modify the code to deal with this issue?

#### Troubleshooting
This class was tested in  Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

``Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt``

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

