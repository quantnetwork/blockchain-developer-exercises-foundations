# Week 2 Ledger State and Updates

## The Accounts Model

### Exercise - Read your first Accounts Transaction

For this task, we will read our first Accounts transaction via Overledger’s autoExecuteSearchTransaction API. The documentation can be found [here](https://docs.overledger.io/#operation/autoExecuteSearchTransactionRequest). 

#### DLT Network Information

We will be interacting with the Ethereum Ropsten and the XRP Ledger testnets. The relevant Overledger location objects are as follows:

1. Location = {“technology”: “Ethereum”, “network”: “Ropsten Testnet”}
   
2. Location = {“technology”: “XRP Ledger”, “network”: “Testnet”}

#### Prerequisites

It is assumed that you have already setup your environment by following [these instructions](./CLASS1.md) and that you have completed the previous exercises to search for a block using Overledger [here](./CLASS2.md) and to search for a UTXO transaction using Overledger [here](./CLASS3.md).


##### Overledger Auto Execute Transaction Search API Response

See [here](./CLASS3.md) for further details on the response body.

###### Auto Execute Transaction Search API Response Origins and Destinations

In the Account model, a payment transaction contains one origin and usually one destination. In the Account model for payment transactions the related identifiers have specific meaning:

- OriginId: This is a reference to the (externally owned) account that is being debited the payment.
  
- DestinationId: This is a reference to the account that is being credited the payment. 

In Ethereum and the XRP Ledger DLTs, there is only one destination for payment transactions. But this is not true for all Accounts based DLTs. For instance the Stellar DLT allows multiple payments in one transaction.

Note that accounts based transactions that are contract invocations have a more complicated origin and destination structure. We will cover that in the next course.

#### Challenges

#### Searching for the Latest Payment Transaction

Given the example `examples/transaction-search/autoexecute-transaction-search.js` file and the location information listed above, can you understand how to change this file to instead return the latest payment transaction on the Ethereum Ropsten and XRP Ledger testnets? Recall that the following is required to run the file:

`node examples/transaction-search/autoexecute-transaction-search.js password=MY_PASSWORD`

Remember that this script first gets the latest block, then if the block is not empty it will ask Overledger for the last transaction in the block. It gets the last transaction as transactions in a block are processed in order. Should the last transaction in the block not be a payment one, then the script will ask Overledger for the previous transaction in the block, and so on until a payment transaction is found.

Note that in the foundations course, you don't have to concern yourself with the other transaction types, but they will be covered in a future course.

All the logic in this script is based on the Overledger standardised data model. This means that the script can easily be reused for other DLTs that are UTXO or Accounts based.

##### Searching for a Specific Transaction

Take a look at a third party explorer for the DLT testnets we are using, e.g. [the Ethereum Ropsten Testnet](https://ropsten.etherscan.io/) or [the XRP Ledger Testnet](https://blockexplorer.one/xrp/testnet).

Choose a transaction from a block in these explorers. Can you understand how to modify the example script to search for your chosen transactions?

#### Troubleshooting
This class was tested in  Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

``Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt``

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

