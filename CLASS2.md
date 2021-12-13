# Week 1 Introduction to Distributed Ledger Technologies

## Distributed Ledger Technologies

### Exercise 1.9 - Read Data From Distributed Ledgers

For this task, we will be reading blocks via Overledger’s autoExecuteSearchBlock API. The openAPI3 version of this endpoint can be found [here](https://docs.overledger.io/#operation/autoExecuteSearchBlockRequest). 

#### DLT Network Information

We will be interacting with the Bitcoin, Ethereum & XRP Ledger testnets. Each network has been designated a location so that Overledger can route requests for these DLT networks correctly. These locations are as follows:

1. Location = {“technology”: “Bitcoin”, “network”: “Testnet”}
2. Location = {“technology”: “Ethereum”, “network”: “Ropsten Testnet”}
3. Location = {“technology”: “XRP Ledger”, “network”: “Testnet”}

Note that Ethereum has a named test network above as Ethereum has multiple test networks. Therefore the additional name differentiates one test network from another. 

#### Prerequisites

It is assumed that you have already setup your environment by following [these instructions]()

#### Searching for the Latest Block

We will start by searching for the latest block on the Bitcoin DLT network. To do so, run the following script:

`node examples/block-search/autoexecute-latest-block-search.js`

##### Overledger Auto Execute Block Search API Response

See that the response has two main objects due to Overledger’s preparation and execution model:

1. PreparationBlockSearchResponse: This includes the request id and any QNT fee that must be paid for use of this endpoint.
2. ExecutionBlockSearchResponse: This includes information on the requested block and related metadata. 

The block information will be returned in cross-DLT standardised form and in the DLT specific form (referred to as nativeData). This allows maximum flexibility to software developers, as they can choose to use either data models.

##### Auto Execute Block Search API Response Main Components

The block response will contain a few main components

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


#### Searching for the Latest Block in Other DLT Networks

Given the example `./block-search/autoexecute-latest-block-search.js` file and the location information listed above, can you understand how to change this file to instead query the latest block on the Ethereum Ropsten and XRP Ledger testnets?


#### Searching for a Specific Block in Other DLT Networks

You can search for a specific block in the Ethereum Ropsten DLT network by running the following:

 `node examples/block-search/autoexecute-specific-blockid-search.js password=MY_PASSWORD`

Notice that to find a valid blockId it firstly searches the current block, then finds the parent of the current block using the standardised data model and searches for that block.

Because the logic of this file is built on the standardised data model, all we have to do to make the same script applicable to the Bitcoin testnet or the XRP Ledger testnet is to change the location object. So give it a go!

Finally note that you can search for a specific block via the blockId or the block number. You can search for a specific block in the XRP Ledger DLT network by running the following:

`node examples/block-search/autoexecute-specific-blocknumber-search.js password=MY_PASSWORD`

#### Troubleshooting
This class was tested in  Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

``Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt``

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

