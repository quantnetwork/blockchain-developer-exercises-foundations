# Week 1 Introduction to Distributed Ledger Technologies

## Distributed Ledger Technologies

### Exercise - Establish Your DLT Network Connection

In this class, we are going to setup the development environment and introduce the Github repository containing the code for assignments. 

The distributed ledger technologies studied can be accessed via Overledger SDK. The SDK that we will be using is written in Javascript, so our development environment will use [Node.js](https://nodejs.org/en/). Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node comes with a package manager called [npm](https://www.npmjs.com/). We will use npm to install the necessary dependencies to our project.

#### Obtaining the project
First, you need to clone the project (or fork and clone). We advise you to [fork the project](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

To clone the project, on the terminal run:
`git clone https://github.com/quantnetwork/blockchain-developer-exercises-foundations` (in case you forked the project, the clone would be `https://github.com/YOUR_USERNAME/blockchain-developer-exercises-foundations`, where `YOUR_USERNAME` is your Github username).

Navigate to the first class folder by typing:
`cd blockchain-developer-exercises-foundations`

You're almost go to go! But first, we need to install the dependencies.

#### Installing Correct Node Version

To manage the different versions of Node.js, we will use the [node version manager (nvm)](https://github.com/nvm-sh/nvm). To do so, on your terminal run:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

and then:

````
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
````

nvm is now installed and ready to use. Now we need to install a specific version of node with nvm. Run:

```
nvm install 16.3.0
```

This installed Node.js version 16.3.0. It is important for everyone to have the same Node version, to avoid inconsistent results when it is running modules. Now we make sure we have the latest npm

```
nvm install-latest-npm
```

We now install a tool allowing us to directly run packages on the terminal:

```
npm install -g npm-run
```

Finally, we need to install the dependencies. Before doing so, examine the file that stores the dependencies, called `package.json`. You will notice that this repository has a set of scripts to help development tasks, a set of administrative-related items, and two sets of dependencies. The first set, `dependencies` state the runtime dependencies, this is, the software packages you will need to use with your code. The second set, `devDependencies` set the dependencies for development that are not used in runtime (for example, the linter).

To install the dependencies, run:

```
npm i
```

The development environment is set! 

#### Signing Up to Overledger


<img src="https://avatars1.githubusercontent.com/u/31103999?s=400&v=4" width="150">

In the following exercises we will connect to DLT nodes via the Overledger DLT gateway. Overledger provides access to multiple DLT networks of different DLT types, allowing multi-ledger applications (mDapps) to be built. Additionally Overledger utilises a standardised data model, easing the learning process for software developers.

To use Overledger, you will need to sign up [here](https://developer.quant.network/). 

Once signed up, you need to scroll to the Wallet tab and click on the "Add Wallet" button on the left. Give your wallet a name and add two different Ethereum addresses. For now you can enter any addresses. The specific addresses would only become relevant should you want to access main DLT networks through Overledger (all of these course exercises will only use test networks). 

After a wallet has been added, select the Applications tab and then select "register mDapp".

#### Setting Your Overledger Connection Details

To connect to the Overledger SDK, you need a number of credentials. Take a look at the file *.env.example.* This file defines environment variables that our programs will later use. The first four environment variables we will be using are:

- USER_NAME: which corresponds to your [Overledger Dev Portal](https://developer.quant.network/login) username (typically an e-mail)
- PASSWORD: is your [Overledger Dev Portal](https://developer.quant.network/login) password
- CLIENT_ID: The unique Id of your mDapp. It is obtained through the applications tab of the [Overledger Dev Portal](https://developer.quannpm installt.network/user/applications) 
- CLIENT_SECRET: The secret associated to your mDapp. Obtained through the applications tab of the [Overledger Dev Portal](https://developer.quant.network/user/applications) 


#### Securing Your Overledger Connection Details

Since the environment variables information is very sensitive, we want to securely fill them in a file that is then encrypted. To do so, duplicate the *.env.example* file and rename it to *.env*. After that, fill the variables USER_NAME, PASSWORD, CLIENT_ID, and CLIENT_SECRET. You may ignore the remaining ones, for now.

Now, we will encrypt the *.env* file. For this, run on your terminal (replace MY_PASSWORD for a password of your choice):

```
npm-run secure-env .env -s MY_PASSWORD
```

Great! Now we have an encrypted env file, *.env.enc*, that will be parsed and securely read by the SDK. For extra security, delete *.env*.

When looking into our scripts that connects to Overledger, you may notice that connections to Overledger use the OAuth2 protocol, meaning your interactions with Overledger are mediated by an access token.

Run the script (make sure to replace MY_PASSWORD by the password you used to encrypt *.env*):

```
node examples/configuration/configure-sdk.js password=MY_PASSWORD
```

Great! You can see how access tokens are obtained from Overledger.

### Troubleshooting
This class was tested in  Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

```
Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt
```

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

