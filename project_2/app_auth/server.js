const fs = require('fs')
const https = require('https');

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  };

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

const Cryptr = require('cryptr');
const cryptr = new Cryptr('ReallySecretKey');

const loginRouter = require('./routes/index');
const studentProfileRouter = require('./routes/studentProfile');
const teacherProfileRouter = require('./routes/teacherProfile');

//Views setup
app.set('view engine','ejs');
app.set('views',__dirname + '/views');
app.set('layout','layouts/layout');
app.use(expressLayouts);
app.use(express.static('public/css')); //styles sheets, js, images ...

//controllers
app.use('/', loginRouter);
app.use('/student',studentProfileRouter);
app.use('/teacher',teacherProfileRouter);

//Crypt db
let fileReadedC = fs.readFileSync('./models/class.json', 'utf-8');
const encryptedC = cryptr.encrypt(fileReadedC);
fs.writeFileSync('./models/Classroom',encryptedC);

let fileReadedS = fs.readFileSync('./models/student.json', 'utf-8');
const encryptedS = cryptr.encrypt(fileReadedS);
fs.writeFileSync('./models/student',encryptedS);

let fileReadedSbj = fs.readFileSync('./models/subject.json', 'utf-8');
const encryptedSbj = cryptr.encrypt(fileReadedSbj);
fs.writeFileSync('./models/subject',encryptedSbj);

let fileReadedT = fs.readFileSync('./models/teacher.json', 'utf-8');
const encryptedT = cryptr.encrypt(fileReadedT);
fs.writeFileSync('./models/teacher',encryptedT);


const PORT= 3000;
var httpsServer = https.createServer(options, app);

httpsServer.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

// app.listen(PORT, ()=>console.log(`App listened at port ${PORT}`))

module.exports = cryptr;