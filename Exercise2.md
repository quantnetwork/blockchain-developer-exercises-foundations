# Week 1 Introduction to Distributed Ledger Technologies

## Distributed Ledger Technologies

### Exercise - Read Data From Distributed Ledgers

In this exercise, we will be reading blocks via Overledger’s *autoExecuteSearchBlock* API. The documentation for this endpoint can be found [here](https://docs.overledger.io/#operation/autoExecuteSearchBlockRequest). 

Recall that Overledger allows two forms of interaction:

- Preparation and Execution: One API call to prepare the request. Another API call to confirm the request.
- AutoExecute: One API call to prepare and confirm the request.

Overledger requires a preparation phase as Overledger’s API data model is standardised across different DLTs, and so the preparation allows a mapping to occur between the Overledger data model and the native data model of each DLT.

The preparation phase can be split from the execution phase, if the user wants to check these mappings have occurred correctly. These split phases also allow a client side audit trail of the mappings to be saved.

For all of the read examples in the course we will use the AutoExecute interaction type.

#### DLT Network Information

We will be interacting with the Bitcoin, Ethereum & XRP Ledger testnets. Each network has been designated a location so that Overledger can route requests for these DLT networks correctly. These locations are as follows:

1. Bitcoin
`Location = {“technology”: “Bitcoin”, “network”: “Testnet”}`

2. Ethereum 
`Location = {“technology”: “Ethereum”, “network”: “Ropsten Testnet”}`

3. XRP
`Location = {“technology”: “XRP Ledger”, “network”: “Testnet”}`

Note that Ethereum has a named test network (Ropsten) above as Ethereum has multiple test networks (e.g. Ropsten, Rinkeby, Kovan etc). Therefore the additional name differentiates one test network from another. 

#### Prerequisites

It is assumed that you have already setup your environment by following [these instructions](./Exercise1.md).

#### Searching for the Latest Block

We will start by searching for the latest block on the Bitcoin DLT network. To do so, run the following script:

```
node examples/block-search/autoexecute-latest-block-search.js password=MY_PASSWORD
```

You will see in the example script (referenced above) that we are using the `"/autoexecution/search/block/latest"` Overledger URL to search for the latest block.

See that the response has two main objects due to Overledger’s preparation and execution model:

1. *PreparationBlockSearchResponse*: This includes the request id and any QNT fee that must be paid for use of this endpoint.
2. *ExecutionBlockSearchResponse*: This includes information on the requested block and related metadata. 

The block information will be returned in cross-DLT standardised form and in the DLT specific form (referred to as nativeData). This allows maximum flexibility to software developers, as they can use different DLTs with the same data model.

##### Auto Execute Block Search API Response Main Components

The block response will contain a few main components:

i. Location: Each Overledger DLT data response includes a reference to the location (technology, network) of where this data was taken from. This helps with auditing.
ii. Status: Overledger responses regarding blocks and transactions come with a status. Due to some DLTs having probabilistic finality of transactions/blocks and other DLTs having deterministic finality of transaction/blocks, the status object is used to indicate to the developer when the requested data is assumed to be final (therefore status.value = “SUCCESSFUL”) or not (therefore status.value=“PENDING”).
iii. Block = The requested block data in standardised and nativeData formats.

For parameter by parameter descriptions see the [openAPI3 doc](https://docs.overledger.io/#operation/autoExecuteSearchBlockRequest).


##### Auto Execute Block Search API Response Array Values

Notice that there are two standardised array parameters that have multiple type options, which we will describe here:

1. executionBlockSearchResponse.block.hashes - This is an array of all the hashes that describe this block. The options are:

A. BLOCK_HASH = The hash of this block. Also referred as to as the blockId

B. PARENT_HASH = The hash of the previous block in the blockchain

C. CHILD_HASH = the hash of the next block in the blockchain

D. TRANSACTIONS_HASH = The hash of all the transactions in the block

E. TRANSACTIONS_MERKLE_ROOT = The Merkle root hash when the transaction of the block are organised into a merkle tree structure

F. STATE_HASH = The hash of the entire current state of the ledger

G. STATE_MERKLE_ROOT = The Merkle root hash, when the current ledger state is organised into a Merkle tree structure

H. TRANSACTIONS_RECEIPT_ROOT = The Merkle root hash, when the transaction processing details are organised into a Merkle tree structure

2. executionBlockSearchResponse.block.size - This is an array of all the sizes that describe this block. The options are: 

A. MEMORY = The memory size of the entire block in terms of the total number of bytes.

B. COMPUTATION = The computational processing size of the block expressed as the number of native individual computational units (e.g. gas for Ethereum, exUnits for Cardano, etc). 


#### Searching for a Specific Block in Other DLT Networks

You can search for a specific block via its blockId in the Ethereum Ropsten DLT network by running the following:

 ```
 node examples/block-search/autoexecute-specific-blockid-search.js password=MY_PASSWORD
 ```

You will see in the example script (referenced above) that we are using the `"/autoexecution/search/block/${blockId}"` Overledger URL to search for a block with the given blockId.

To search for a specific valid blockId, the script firstly searches for the current block using the latest keyword, then finds the blockId of the latest block's parent and uses that blockId to search.

Because the logic of this file is built on the standardised data model, all we have to do to make the same script applicable to the Bitcoin testnet or the XRP Ledger testnet is to change the location object (in line 63). So give it a go!

Finally note that you can search for a specific block via the blockId or the block number. You can search for a specific block number in the XRP Ledger DLT network by running the following:

```
node examples/block-search/autoexecute-specific-blocknumber-search.js password=MY_PASSWORD
```

You will see in the example script (referenced above) that we are using the `"/autoexecution/search/block/${blockNumber}"` Overledger URL to search for a block with the given blockNumber.

The logic of this script is similar to the previous one. I.e. the script searches for the latest block first to find the current block number, and then finds the blockNumber of the latest block's parent and uses that blockNumber to search. Again the Overledger standardised data model is used so again this script can be modified to operate over other DLT Networks by simply changing the location object.

#### Challenges

##### Searching for the Latest Block in Other DLT Networks

Given the example `examples/block-search/autoexecute-latest-block-search.js` file and the location information listed above, can you understand how to change this file to instead query the latest block on the Ethereum Ropsten and XRP Ledger testnets? Hint: Look at the overledgerRequestMetaData object.

##### Searching for a Specific Block

Take a look at a third party explorer for the DLT testnets we are using, e.g. [the Bitcoin Testnet](https://blockstream.info/testnet/), [the Ethereum Ropsten Testnet](https://ropsten.etherscan.io/), or [the XRP Ledger Testnet](https://blockexplorer.one/xrp/testnet). 

Choose a block from these explorers. Can you understand how to modify the example scripts to search for your chosen block?

#### Troubleshooting
This exercise was tested in Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

This exercise was additionally tested in MacOS Monterey Version 12.0.1, with nvm version 0.39.0, and node version 16.3.0. 

#### Error: Bad Decrypt 

Description:

```
Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt
```

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.


#### Error: Encrypted Environment File Does Not Exist 

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
