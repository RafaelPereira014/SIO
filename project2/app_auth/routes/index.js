process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const express = require('express');
const router = express.Router();
const teacherDB = require('../models/teacher.json');
const studentDB = require('../models/student.json');
let rawData = fs.readFileSync('data.json');
let data = JSON.parse(rawData);

const urlEncoded = express.urlencoded({extended: false});

router.get('/',(req,res)=>{
    res.render('index');
});

const SERVICE_NAME = 'webschool';
let oldNonce = '';
let match = true;
router.get('/auth',(req,res)=>{
    if(req.headers.type == 'hello') {
        let newNonce = crypto.randomBytes(16).toString('base64');   // Generate new nonce for new challenge
        
        // Send https with challenge
        const options = {
            hostname: 'localhost',
            port: 4500,
            path: '/auth',
            method: 'GET',
            headers: {'username': req.headers.username, 'type': 'hello', service: SERVICE_NAME, 'id': 1, nonce: newNonce}
        };
    
        https.get('https://localhost:4500/auth', options).on('error', (e) => {
            console.log('ERROR', + e);
        });

        // Save nonce for next turn of authentication
        oldNonce = newNonce;

    } else if(req.headers.type == 'auth') {
        let receivedNonce = req.headers.nonce;                      // Get nonce from field in chap packet
        let newNonce = crypto.randomBytes(16).toString('base64');   // Generate new nonce

        // GET PASSWORD
        let users = data[SERVICE_NAME];
        let password = '';
        for(let user of users){
            if(user.username == req.headers.username){
                password = user.password;
                break;
            }
        }

        // Generate and answer challenge
        let challenge = password + oldNonce + receivedNonce;
        let challengeResponse = crypto.createHash('md5').update(challenge).digest("hex");
        // Get first bit from first character in generated response 
        let response = challengeResponse[0] & 0x1;

        // Save nonce for next turn of authentication
        oldNonce = newNonce;

        let newChallenge = password + receivedNonce + newNonce;
        let newChallengeResponse = crypto.createHash('md5').update(newChallenge).digest("hex");
        // Get first bit from first character in generated response 
        let newResponse = newChallengeResponse[0] & 0x1;
        
        // Check if self generated responde matches with received response
        if(match == false || response != req.headers.response) { // Unmatch -> send random response
            match = false;
            newResponse = Math.floor((Math.random() + 1)); // 0 or 1 randomly
        }

        // Send https packet with nonce for new challenge and response for last challenge
        let options = {
            hostname: 'localhost',
            port: 4500,
            path: '/auth',
            method: 'GET',
            headers: {'username': req.headers.username, 'type': 'auth', service: SERVICE_NAME, 'id': ++req.headers.id, 'nonce': newNonce, 'response': newResponse}
        };

        https.get('https://localhost:4500/auth', options).on('error', (e) => {
            console.log('ERROR', + e);
        });
    } else if(req.headers.type == 'goodbye') {
        console.log('LOGIN_SUCCESSFULL: ' + req.headers.login_successfull)
        res.redirect('https://localhost:3000/');
    }
});

router.post('/',urlEncoded, (req,res)=>{
    res.redirect('https://localhost:4500/');
});

router.get('/login', (req, res) => {
    console.log('LOGIN');
    res.redirect('/');
})

router.get('/logout', (req, res) => {
    res.redirect('/');
})

module.exports = router;