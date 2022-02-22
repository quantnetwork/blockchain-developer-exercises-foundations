# Week 1 Introduction to Distributed Ledger Technologies

## Distributed Ledger Technologies

### Exercise - Establish Your DLT Network Connection

In this exercise, we are going to setup the development environment and introduce the Github repository containing the code for assignments. 

The distributed ledger technologies studied can be accessed via the Overledger DLT Gateway. We will be using the Overledger Javascript v2 SDK to interact with Overledger. Therefore our development environment will use [Node.js](https://nodejs.org/en/). Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node comes with a package manager called [npm](https://www.npmjs.com/). We will use npm to install the necessary dependencies to our project.

Note that more details on the SDK used in this course can be found [here](https://github.com/quantnetwork/overledger-sdk-javascript-v2). The examples in this course were made specifically to complement the FutureLearn course theory. There are additional more simple examples using this SDK found [here](https://github.com/quantnetwork/overledger-sdk-javascript-v2/tree/develop/examples).

#### Obtaining the project
First, you need to download this repository code onto your local computer. To do so, we advise you to [fork the project](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and clone the code. If you fork the project first, you will be able to push your changes into your own repository, so that you can more easily discuss your code with fellow learners.

To clone the project after you have forked, open a terminal in your desired folder and run: `git clone https://github.com/YOUR_USERNAME/blockchain-developer-exercises-foundations`, where `YOUR_USERNAME` is your Github username). Alternatively, if you have not forked, you can run `git clone https://github.com/quantnetwork/blockchain-developer-exercises-foundations`.

Now navigate to the exercises folder by typing:
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

Once signed up, there are a few steps you need to perform to select the correct environment and add a wallet:

- Firstly select the "Sandbox V2.0" environment.
- Then scroll to the "Wallets" tab and click on the "Add Wallet" button. 
- Select an "Application" wallet. 
- Give your wallet a name.
- Add two different Ethereum addresses in your wallet. The specific addresses only become relevant should you want to access main DLT networks through Overledger (all of these course exercises will only use test networks). For these exercises, you can add any Ethereum addresses. But briefly, should you move to mainnet and use our pay-as-you-go pricing model, the QNT address would be the Ethereum address that is paying QNT for specific API calls, whereas the operator address can call functions on our payment channels that implement the pay-as-you-go pricing model.  

After a wallet has been added, you next need to setup an application, to do so:

- Scroll to the "Applications" tab.
- Click on the "register mDapp" button.
- Give your application a name and select the wallet you just created.
- Note that a callback URL is *not* needed for these developer exercises, as it is used for more advanced features.

Now you have setup Overledger server side. Next you need to setup client side.

#### Setting Your Overledger Connection Details

To connect and use the Overledger DLT Gateway, you need a number of credentials. Take a look at the file *.env.example* This file defines environment variables that our examples will later use. The first four environment variables we will be using are:

- USER_NAME: which corresponds to your [Overledger Dev Portal](https://developer.quant.network/login) username (typically an e-mail)
- PASSWORD: is your [Overledger Dev Portal](https://developer.quant.network/login) password
- CLIENT_ID: The unique ID of your mDapp. It is obtained through the applications tab of the [Overledger Dev Portal](https://developer.quant.network/user/applications) 
- CLIENT_SECRET: The secret associated to your mDapp. Obtained through the applications tab of the [Overledger Dev Portal](https://developer.quant.network/user/applications) 

Note that in Exercise 7 we will be adding to the parameter list in the *.env* file to include private keys and addresses.


#### Securing Your Overledger Connection Details

Since the environment variables information is very sensitive, we want to securely fill them in a file that is then encrypted. To do so, duplicate the *.env.example* file and rename it to *.env*. After that, fill the variables USER_NAME, PASSWORD, CLIENT_ID, and CLIENT_SECRET. You may ignore the remaining ones, for now.

Now, we will encrypt the *.env* file. For this, run on your terminal (replace MY_PASSWORD for a password of your choice):

*Note that MY_PASSWORD is a password for the encryption of the .env file and decryption of the .env.enc file. It does not related to your Overledger password described in the previous section.*

```
npm-run secure-env .env -s MY_PASSWORD
```
or 
```
secure-env .env -s MY_PASSWORD
```

Note that if you are running on windows and the above did not work, try:
```
./node_modules/secure-env/dist/es5/lib/cli.js .env -s MY_PASSWORD
```

Great! Now we have an encrypted env file, *.env.enc*, that will be parsed and securely read by the SDK. For extra security, delete *.env*.

When looking into our scripts that connects to Overledger, you may notice that connections to Overledger use the OAuth2 protocol, meaning your interactions with Overledger are mediated by an access token.

To see an example of these tokens, run the following script (make sure to replace MY_PASSWORD by the password you used to encrypt *.env*):

```
node examples/configuration/configure-sdk.js password=MY_PASSWORD
```

Great! You can see how tokens are obtained from Overledger. Three types of tokens are given (following the [OAuth 2.0 protocol](https://oauth.net/2/)): the `access token`, the `refresh token` and the `id token`. 

The `access token` allows our examples to make API requests on behalf of you. In practice, you are issuing requests to Overledger, and this token authenticates you. It is important that you keep this token private, as someone holding it can make requests to Overledger on your behalf. The access token has an expiration date, typically ranging from a few hours to a few weeks. The `refresh token` does not expire and it is used to re-issue an access token. The refresh token helps the user avoid signing in every time an access token expires. The `id token` refers to a token specific to [OpenID Connect](https://openid.net/connect/), a protocol built on top of OAuth 2.0. The id token encodes the user’s authentication information, for example, different types of attributes.

All the tokens are [JSON Web Tokens (JWT)](https://en.wikipedia.org/wiki/JSON_Web_Token). "JWTs are an open, industry standard RFC 7519 method for representing claims securely between two parties".

You can inspect the content of each token with a [JWT decoder](https://jwt.io/). 


### Troubleshooting
This exercise was tested firstly in Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

This exercise was additionally tested in MacOS Monterey Version 12.0.1, with nvm version 0.39.0, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

```
Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt
```

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

#### Error: ENOENT

Description:
```
Error: spawn secure-env ENOENT
```
Cause: If you are running on windows you can encounter this error.

Solution: Run `./node_modules/secure-env/dist/es5/lib/cli.js .env -s MY_PASSWORD`. If you are still having trouble, consult [here](https://www.npmjs.com/package/secure-env#encrypt-env) for alternative command line options.


