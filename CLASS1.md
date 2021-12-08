# Week 1 Introduction to Distributed Ledger Technologies

## Distributed Ledger Technologies

### Exercise 1.6 - Establish Your DLT Network Connection

In this class, we are going to setup the development environment and introduce the Github repository containing the code for assignments. 

The technologies studied can be accessed via Overledger SDK. The SDK is written in Javascript, so our development environment will use [Node.js](https://nodejs.org/en/). Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node comes with a package manager called [npm](https://www.npmjs.com/). We will use npm to install the necessary dependencies to our project.

To manage the different versions of Node.js, we will use the [node version manager (nvm)](https://github.com/nvm-sh/nvm). To do so, on your terminal run:

``curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
``

and then:

``xport NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"``

nvm is now installed and ready to use. Now we need to install a specific version of node with nvm. Run:

``nvm install 16.3.0``

This installed Node.js version 16.3.0. It is important for everyone to have the same Node version, to avoid inconsistent results when it is running modules. Now we make sure we have the latest npm

``nvm install-latest-npm``

We now install a tool allowing us to directly run packages on the terminal:

``npm install -g npm-run``

The development environment is set! 
To connect to the Overledeger SDK, one needs a number of credentials. Take a look at the file *.env.example.*
This file defines environment variables that our programs will later use. They are USER_NAME, PASSWORD, CLIENT_ID, and CLIENT_SECRET. The USER_NAME corresponds to your Overledger's Dev Portal username (typically an e-mail). The PASSWORD is your Overledger's Dev Portal PASSWORD. The remaining variables are obtained when creating a mdApp.

To obtain those, you should have obtained the correct credentials, as explained in Exercise 1.6.

Since this information is very sensitive, we want to securely fill them in a file that is then encrypted. Duplicate the *.env.example* file and rename it to *.env*. After that, fill the variables USER_NAME, PASSWORD, CLIENT_ID, and CLIENT_SECRET. You may ignore the remaining ones, for now.

Now, we will encrypt the *.env* file. For this, run on your terminal (replace MY_PASSWORD for a password of your choice):

``npm-run secure-env .env -s MY_PASSWORD``

Great! Now we have an encrypted env file, *.env.enc*, that will be parsed and securely read by the SDK. For extra security, delete *.env*.

You can look into our script that connects to Overledger. Connections to Overledger use the OAuth2 protocol, meaning your interactions with Overledger are mediated by an access token.

Run the script (make sure to replace MY_PASSWORD by the password you used to encrypt *.env*):

``node configure-sdk.js password=MY_PASSWORD``

Great! You should see in as an output an access token that can be used in the next classes.

### Troubleshooting
This class was tested in  Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

``Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt``

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

