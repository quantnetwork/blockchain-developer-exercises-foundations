# Week 2 Ledger State and Updates

## The Unspent Transaction Output Model

### Exercise - Read your first UTXO Transaction

In this exercise, we will read our first UTXO transaction via Overledger’s autoExecuteSearchTransaction API. The documentation for this endpoint can be found [here](https://docs.overledger.io/#operation/autoExecuteSearchTransactionRequest). 

#### DLT Network Information

We will be interacting with the Bitcoin testnet. The relevant Overledger location object is as follows:

``Location = {“technology”: “Bitcoin”, “network”: “Testnet”}``

#### Prerequisites

It is assumed that you have already setup your environment by following [these instructions](./Exercise1.md) and that you have completed the previous exercise to search for a block using Overledger [here](./Exercise2.md).

#### Searching for the Latest Payment Transaction

We will demostrate searching for a UTXO transaction through a specific example. In this example we will search for the latest payment transaction on the Bitcoin test network. To do so, run the following script:

```
node examples/transaction-search/autoexecute-transaction-search.js password=MY_PASSWORD
```

You will see in the example script that we are using the `/autoexecution/search/transaction?transactionId=${transactionId}` Overledger URL to search for the given transactionId.

The full details of this script is as follows. Firstly it gets the latest block, then if the block is not empty it will ask Overledger for the last transaction in the block. It gets the last transaction as transactions in a block are processed in order. Should the last transaction in the block not be a payment one, then the script will ask Overledger for the previous transaction in the block, and so on until a payment transaction is found.

Note that in the foundations course, you don't have to concern yourself with the other transaction types, but they will be covered in a future course.

All the logic in this script is based on the Overledger standardised data model. This means that the script can easily be reused for other DLTs that are UTXO or Accounts based. All that is required is to change the location object to another network.

##### Overledger Auto Execute Transaction Search API Response

See that the response has two main objects due to Overledger’s preparation and execution model:

1. PreparationTransactionSearchResponse: This includes the request id and any QNT fee that must be paid for use of this endpoint.
2. ExecutionTransactionSearchResponse: This includes information on the requested transaction and related metadata. 

The transaction information will be returned in cross-DLT standardised form and in the DLT specific form (referred to as nativeData). This allows maximum flexibility to software developers, as they can choose to use either data models.

##### Auto Execute Transaction Search API Response Main Components

The transaction response will contain a few main components. Notice that the metadata components (location and status) are the same for a transaction as they are with a block.

1. Location: Each Overledger DLT data response includes a reference to the location (technology, network) of where this data was taken from. This helps with auditing.

2. Status: Overledger responses regarding blocks and transactions come with a status. Due to some DLTs having probabilistic finality of transactions/blocks and other DLTs having deterministic finality of transaction/blocks, the status object is used to indicate to the developer when the requested data is assumed to be final (therefore status.value = “SUCCESSFUL”) or not (therefore status.value=“PENDING”).

3. Transaction = The requested transaction data in standardised and nativeData formats.

For parameter by parameter descriptions see the [documentation](https://docs.overledger.io/#operation/autoExecuteSearchTransactionRequest).

###### Auto Execute Transaction Search API Response Origins and Destinations

In the UTXO model, a transaction contains one or more origins (inputs) and one or more destinations (outputs). In the UTXO model the origin and destination identifiers have specific meanings:

- OriginId: This is a reference to the transactionId and DestinationArrayIndex of an unspent transaction output that is now being spent.
- DestinationId: This is a reference to an externally owned account (controlled by a private key) or to a smart contract address (controlled by smart contract code). An externally owned account requires a signature to spent the BTC associated to this transaction output. Whereas a smart contract address requires some user defined parameters to be satisfied in order for the transaction output to be spent.

#### Challenges

##### Searching for a Specific Transaction

Take a look at a third party explorer for the Bitcoin testnet we are using, e.g. [here](https://blockstream.info/testnet/). 

Choose a transaction from a block in this explorer. Can you understand how to modify the example script to search for your chosen transaction?

#### Troubleshooting
This exercise was tested in Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0.

This exercise was additionally tested in MacOS Monterey Version 12.0.1, with nvm version 0.39.0, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

```
Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt
```

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

#### Error: .env.enc does not exist 

Description:

```
Secure-env :  ERROR OCCURED .env.enc does not exist.
```

Cause: You are missing the encrypted environment file in the folder that you are running from.

Solution: Return to the top level folder and encrypt .env as described in Exercise 1.

#### Error: Missing Password

Description:

```
Error: Please insert a password to decrypt the secure env file.
```

Cause: You did not include the password as a command line option.

Solution: Include the password as a command line option as stated in your terminal print out.