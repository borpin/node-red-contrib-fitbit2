const ClientOAuth2 = require('client-oauth2');
const request = require('request');
const fs = require('fs');

let refreshPromise;
let tokens = {};

// loadTokens();

module.exports = function (RED) {
    // Not ideal but store the credentials in the userDir - should be portable.
    const FILE_PATH = RED.settings.userDir + "/" + 'fitbit-oauth-tokens.json';

    function loadTokens() {
        const OLD_FILE_PATH = 'fitbit-oauth-tokens.json'; 
        // Clean up old token file if it exists

        if (fs.existsSync(OLD_FILE_PATH)) {
            fs.renameSync(OLD_FILE_PATH, FILE_PATH, function (err) {
                if (err) {
                    console.error("Tokens file rename error: ", err);
                    throw new Error("Tokens file rename error: ", {cause: err});
                } else {
                    console.log('Successfully renamed - AKA moved Token File!')
                }
            });
        }
        
        if (fs.existsSync(FILE_PATH)) {
            const data = fs.readFileSync(FILE_PATH, function (err) {
                if (err) {
                    console.error("Tokens file error: ", err);
                    throw err;
                }
            });
            tokens = JSON.parse(data);
        } else {
            fs.writeFileSync(FILE_PATH, '{}');
            tokens = {};
        }
    }

    function saveNewToken(credentialsID, tokenData) {
        console.error("Token to save : ", tokenData);
        tokens[credentialsID] = {
            access_token: tokenData.data.access_token,
            expires: tokenData.expires,
            refresh_token: tokenData.data.refresh_token
        }
    
        fs.writeFileSync(FILE_PATH, JSON.stringify(tokens), function (err) {
            if (err) {
                console.error("Tokens file could not be written to disk: ", err);
            }
        });
    }

    function getFitbitOauth(credentials) {
        return new ClientOAuth2({
            clientId: credentials.clientID,
            clientSecret: credentials.clientSecret,
            accessTokenUri: 'https://api.fitbit.com/oauth2/token',
            authorizationUri: 'https://www.fitbit.com/oauth2/authorize',
            scopes: ['activity', 'heartrate', 'location', 'nutrition', 'profile', 'settings', 'sleep', 'social', 'weight']
        });
    }

    function _makeRequest(method, url, token) {
        return new Promise((resolve, reject) => {
            request(token.sign({
                method: method,
                url: url
            }), (err, response, _body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

    function makeRequest(method, url, credentials, credentialsID) {
        const oauth = getFitbitOauth(credentials);
        let token = {};

        try {
            token = oauth.createToken({
                access_token: tokens[credentialsID].access_token,
                expires_in: (new Date(tokens[credentialsID].expires).getTime() - new Date().getTime()) / 1000,
                token_type: 'Bearer',
                refresh_token: tokens[credentialsID].refresh_token,
                user_id: credentials.user_id,
                clientID: credentials.clientID,
                clientSecret: credentials.clientSecret
            });
        } catch (err) {
            if (!tokens[credentialsID]) {
                throw new Error("Token not found - reauthorise Fitbit", {cause: err});
            } else {
                throw err;
            }
        }

        let requestPromise;
        if (token.expired()) {
            // Only refresh once
            if (!refreshPromise) {
                refreshPromise = token.refresh().then(newToken => {
                    saveNewToken(credentialsID, newToken);
                    refreshPromise = undefined;
                    return newToken;
                })
            }

            requestPromise = refreshPromise.then(newToken => {
                return _makeRequest(method, url, newToken);
            })
        } else {
            requestPromise = _makeRequest(method, url, token);
        }

        return requestPromise.catch(err => {
            throw new Error("Error requesting from fitbit", {cause: err});
            // console.error("Error requesting from fitbit", err);
        });
    }

    return {
        loadTokens,
        saveNewToken,
        makeRequest,
        getFitbitOauth
    }
}
