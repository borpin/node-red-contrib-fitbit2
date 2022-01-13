# node-red-contrib-fitbit2

<a href="http://nodered.org" target="_new">Node-RED</a> node that gets information from the Fitbit API.

This node was updated using <https://github.com/inglevir/node-red-contrib-fitbit> as the base. The node was renamed to **fitbit2** to avoid backward compatibility with the core node.

## Install

-------

Run the following command in the root directory of your Node-RED install to install from the Git repository (not currently in NPM).

        npm install borpin/node-red-node-fitbit2 --save

## Configure

-------

When creating a configuration for Fitbit you will need to create an app on <https://dev.fitbit.com> with the following settings:

- Callback Url: `https://<YOUR-NODE-RED-SERVER>/fitbit-credentials/auth/callback`
  - Please note the URL **must be HTTPS** (self-signed SSL works).
- OAuth 2.0 Application Type: Server

Other settings are up to you. The app is not fussy about the other URLs.

## Usage

-------

One node that gets reports from <a href="http://www.fitbit.com" target="_new">Fitbit</a> via the Web API <https://dev.fitbit.com/build/reference/web-api/>

### Query node

Fitbit query node supports several endpoints

- Get Devices information
- Get Activity Log List
- Get Daily Activity Summary
- Get Activity Timeseries
- Get Body Timeseries
- Get Food Timeseries
- Get Food Log
- Get Sleep Log by date
- Get Sleep Log List
- Log Body Weight
- Log Body Fat
- Log activity
- Log food
- Delete activity
- Delete log food

Depending on the endpoint selected the node will allow different inputs to filter the fitbit query.

### Note

Node-RED does not currently have a way to update credential data at runtime. App credentials are stored with other credentials but OAuth2 tokens are saved to disk.
