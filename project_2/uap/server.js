process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const https = require('https');
const fs = require('fs');

const crypto = require('crypto');
let nonce = crypto.randomBytes(16).toString('base64');

const express = require("express");
const session = require("express-session");
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();

var path = require('path');
const app = express();

let rawData = fs.readFileSync('data.json');
let data = JSON.parse(rawData);

//static files
app.use(express.static('public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('public', express.static(path.join(__dirname, 'public')));
app.use(session({secret: "qwerty", resave: true, saveUninitialized: true}));
app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, '/views'));

let SERVICE_NAME = '';

app.get('/', (req, res) => {
    SERVICE_NAME = req.headers.referer;
    res.render('login');
});

let INPUT_PASSWORD = '';
app.post('/', (req, res) => {
    // Get password from user form
    INPUT_PASSWORD = req.body.password;

    let options = {
        headers: {'username': req.body.username, 'type': 'hello'},
    };

    https.get(SERVICE_NAME + 'auth', options).on('error', (e) => {
        console.log('ERROR', + e);
    });
});

let N = 100;          // N -> Number of executions of authentication protocol
let oldNonce = '';
let match = true;   // Challenge-response match
app.get('/auth', (req, res) => {
    if(req.headers.type == 'hello') {   
        let receivedNonce = req.headers.nonce;                         // Get nonce from field in chap packet               
        let newNonce = crypto.randomBytes(16).toString('base64');   // Generate new nonce

        // Generate response for challenge
        let challenge = INPUT_PASSWORD + receivedNonce + newNonce;
        let challengeResponse = crypto.createHash('md5').update(challenge).digest("hex");
        // Get first bit from first character in generated response 
        let response = challengeResponse[0] & 0x1;
        
        oldNonce = newNonce;

        // Send https packet with nonce for new challenge and response for last challenge
        let options = {
            headers: {'username': req.headers.username, 'type': 'auth', 'nonce': newNonce, 'response': response, 'id': 0}
        };

        https.get(SERVICE_NAME + 'auth', options).on('error', (e) => {
            console.log('ERROR', + e);
        });

    } else if(req.headers.type == 'auth') {
        let receivedNonce = req.headers.nonce;                         // Get nonce from field in chap packet               
        let newNonce = crypto.randomBytes(16).toString('base64');   // Generate new nonce

        // Generate response for challenge
        let challenge = INPUT_PASSWORD + oldNonce + receivedNonce;
        let challengeResponse = crypto.createHash('md5').update(challenge).digest("hex");
        // Get first bit from first character in generated response 
        let response = challengeResponse[0] & 0x1;

        // Generate new response for challenge
        let newChallenge = INPUT_PASSWORD + receivedNonce + newNonce;
        let newChallengeResponse = crypto.createHash('md5').update(newChallenge).digest("hex");
        // Get first bit from first character in generated response 
        let newResponse = newChallengeResponse[0] & 0x1;
        
        oldNonce = newNonce;

        // Check if response from remote matches with self-generated response
        if(match == false || response != req.headers.response) { // Unmatch -> random response
            match = false;
            newResponse = Math.floor((Math.random() + 1)); // 0 or 1 randomly
        }

        // If N or more iterations of authentication, ends connection with goodbye
        let type = '';
        let options = {};
        if(req.headers.id > N) {
            type = 'goodbye';
            options = {
                headers: {'username': req.headers.username, 'type': type, id: ++req.headers.id, 'nonce': newNonce, 'response': newResponse, 'login_successfull': match}
            };
            console.log('GOODBYE');
            
        } else {
            type = 'auth';
            options = {
                headers: {'username': req.headers.username, 'type': type, id: ++req.headers.id, 'nonce': newNonce, 'response': newResponse}
            };
        }

        https.get(SERVICE_NAME + 'auth', options).on('error', (e) => {
            console.log('ERROR', + e);
        });
    }
});

const PORT = 4500;
const httpsOptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  };
var httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});