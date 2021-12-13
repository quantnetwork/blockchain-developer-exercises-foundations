# Week 2 Ledger State and Updates

## The Unspent Transaction Output Model

### Exercise 2.4 - Read your first UTXO Transaction

For this task, we will read our first UTXO transaction via Overledger’s autoExecuteSearchTransaction API. The openAPI3 version of this endpoint can be found [here](https://docs.overledger.io/#operation/autoExecuteSearchTransactionRequest). 

#### DLT Network Information

We will be interacting with the Bitcoin testnet. This network has been designated a location so that Overledger can route requests for these DLT networks correctly. This location is as follows:

1. Location = {“technology”: “Bitcoin”, “network”: “Testnet”}

#### Prerequisites

It is assumed that you have already setup your environment by following [these instructions]() and that you have completed the previous exercise to search for a block using Overledger [here]().

#### Searching for the Latest Payment Transaction

We will search for the latest payment transaction on the Bitcoin test network. To do so, run the following script:

`node examples/transaction-search/autoexecute-transaction-search.js password=MY_PASSWORD`

This script first gets the latest block, then if the block is not empty it will ask Overledger for the last transaction in the block. It gets the last transaction as transactions in a block are processed in order.

All the logic in this script is based on the Overledger standardised data model. This means that the script can easily be reused for other DLTs that are UTXO or Accounts based. All that is required is to change the location object to another network.

##### Overledger Auto Execute Transaction Search API Response

See that the response has two main objects due to Overledger’s preparation and execution model:

1. PreparationTransactionSearchResponse: This includes the request id and any QNT fee that must be paid for use of this endpoint.
2. ExecutionTransactionSearchResponse: This includes information on the requested transaction and related metadata. 

The transaction information will be returned in cross-DLT standardised form and in the DLT specific form (referred to as nativeData). This allows maximum flexibility to software developers, as they can choose to use either data models.

##### Auto Execute Transaction Search API Response Main Components

The transaction response will contain a few main components. Notice that the metadata components (location and status) are the same for a transaction as they are with a block.

i. Location: Each Overledger DLT data response includes a reference to the location (technology, network) of where this data was taken from. This helps with auditing.
ii. Status: Overledger responses regarding blocks and transactions come with a status. Due to some DLTs having probabilistic finality of transactions/blocks and other DLTs having deterministic finality of transaction/blocks, the status object is used to indicate to the developer when the requested data is assumed to be final (therefore status.value = “SUCCESSFUL”) or not (therefore status.value=“PENDING”).
iii. Transaction = The requested transaction data in standardised and nativeData formats.

For parameter by parameter descriptions see the [openAPI3 doc](https://docs.overledger.io/#operation/autoExecuteSearchBlockRequest).

###### Auto Execute Transaction Search API Response Origins and Destinations

In the UTXO model, a transaction contains one or more origins (inputs) and one or more destinations (inputs). In the UTXO model the related identifiers have specific meaning:

- OriginId: This is a reference to a transactionId:DestinationArrayIndex of an unspent transaction output that is now being spent.
- DestinationId: This is a reference to an externally owned account (controlled by a private key) or to a smart contract address (controlled by smart contract code). An externally owned account requires a signature to spent the BTC associated to this transaction output. Whereas a smart contract address requires some user defined parameters to be satisfied in order for the transaction output to be spent. 


#### Troubleshooting
This class was tested in  Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

``Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt``

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

