const express = require("express");
const session = require("express-session");
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./users.db')

const port = 3000;
var path = require('path');
const app = express();


//static files
app.use(express.static('public'));


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('public', express.static(path.join(__dirname, 'public')));
app.use(session({secret: "qwerty", resave: true, saveUninitialized: true}));
app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, '/views'));

// Const teachers
const teachers={
    "qteacher": "João José Tomate",
    "fteacher": "Alberto Astuto",
    "mteacher":"Renan Descalço"
}


var studentLogin = false;

//Routes

//Initial page
app.get('/', (req, res) => {
    if(req.session.username) {
        if(studentLogin) {
            res.render('student',{name:req.session.username,number:req.session.number, saldo:req.session.saldo,qteacher:req.session.qteacher,fteacher:req.session.fteacher,mteacher:req.session.mteacher});
        } else
            res.render('teacher',{name:req.session.username, subject:req.session.subject});
    } else {
        res.render('login');
    }
});

//login route
app.post('/login', (req, res) => {

    sqlCommand1 = `SELECT * FROM student WHERE username='${req.body.username}' and password='${req.body.password}'`;
    sqlCommand2 = `SELECT * FROM teacher WHERE username='${req.body.username}' and password='${req.body.password}'`;

    let validate = false

    db.all(sqlCommand1, function(err,rows){
        rows.forEach(function (row) {
                if(row.username && row.password){
                    validate = true;
                    studentLogin = true;
                    req.session.username = row.username;
                    req.session.name = row.name;
                    req.session.number = row.number;
                    req.session.saldo = row.saldo;
                    req.session.qteacher = teachers['qteacher'];
                    req.session.fteacher = teachers['fteacher'];
                    req.session.mteacher = teachers['mteacher'];
                    res.render('student',{name:req.session.username,number:req.session.number,saldo:req.session.saldo,qteacher:req.session.qteacher,fteacher:req.session.fteacher,mteacher:req.session.mteacher});
                }    
        });
    });
    if(!validate){
        db.all(sqlCommand2, function(err,rows){
            rows.forEach(function (row) {
                    if(row.username && row.password){
                        validate = true;
                        studentLogin = false;
                        req.session.username = row.username;
                        req.session.name = row.name;
                        req.session.subject = row.subject;
                        res.render('teacher',{name:req.session.name, subject:req.session.subject});
                    }    
            });
            if(!validate) res.end('Invalid username or password');
        });
    }
});



app.get('/search_result', (req, res) => {
    const sqlCommand = `SELECT * FROM student WHERE name='${req.session.name}' AND classroom='${req.query.search}'`;
    console.log(sqlCommand);
    db.all(sqlCommand, (err, rows) => {
        if(err) {
            res.send("Not found");
        } else {

            let com = "<div>Result for: " + req.query.search + "<br><ul>\n"
            rows.forEach(function(row) {
                const name = row.name;
                const grade = row.grade;
                com += "<li>" + name + " | " + grade + "</li>";
            });
            com += "</ul></div>";
            res.render('search_result', {result:com});
        }
    });

});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/propinas', (req, res) => {
    res.render('propinas');
});

app.post('/question', (req, res) => {
    const text = req.body.comment;
    let teacher = teachers[req.body.teacher];
    console.log(teacher);

    const sqlCommand = `INSERT INTO questions (username, content, teacher) VALUES ('${req.session.username}', '${text}', '${teacher}')`
    db.run(sqlCommand);
    console.log(sqlCommand);
    res.redirect('/');
});

app.get('/question', (req, res) => {
    if(studentLogin) {
        res.send("Access denied");
    } else {
        sqlCommand = `SELECT * FROM questions WHERE teacher='${req.session.name}'`;
        console.log(sqlCommand);
        db.all(sqlCommand, (err, rows) => {
            if(err) {
                res.send("Not found");
            } else {
                let com = "<div><h1>Questions for : " + req.session.name + "</h1><br><br>\n"
                rows.forEach(function(row) {
                    console.log(row);
                    const username = row.username;
                    const text = row.content;
                    com += "<h3>Student: " + username + "</h3><br>" + text + "<br>";
                });
                com += "</div>"
                res.render('questions', {result:com});
            }
        });
    }
});

app.post('/propinas', (req, res) => {
    sqlCommand1 = `Select saldo from student WHERE number='${req.session.number}'`;
    
    var saldo = 0;
    
    db.all(sqlCommand1, (err, rows) => {
        rows.forEach(function(row) {
            saldo = row['saldo'];
            const payment = req.body.pay;
            saldo -= payment;
            sqlCommand2 = `UPDATE student SET saldo=${saldo} WHERE number='${req.session.number}'`;
            db.run(sqlCommand2);
            req.session.saldo = saldo;
        });
    });

    res.redirect('/');
});

app.post('/login', (req, res) => {

    sqlCommand1 = `SELECT * FROM student WHERE username='${req.body.username}' and password='${req.body.password}'`;
    sqlCommand2 = `SELECT * FROM teacher WHERE username='${req.body.username}' and password='${req.body.password}'`;

    let validate = false

    db.all(sqlCommand1, function(err,rows){
        rows.forEach(function (row) {
                if(row.username && row.password){
                    validate = true;
                    studentLogin = true;
                    req.session.username = row.username;
                    req.session.name = row.name;
                    req.session.number = row.number;
                    req.session.saldo = row.saldo;
                    req.session.qteacher = qteacher;
                    req.session.fteacher = fteacher;
                    req.session.mteacher = mteacher;
                    res.render('student',{name:req.session.username,number:req.session.number,saldo:req.session.saldo,qteacher:req.session.qteacher,fteacher:req.session.fteacher,mteacher:req.session.mteacher});
                }    
        });
    });
    if(!validate){
        db.all(sqlCommand2, function(err,rows){
            rows.forEach(function (row) {
                    if(row.username && row.password){
                        validate = true;
                        studentLogin = false;
                        req.session.username = row.username;
                        req.session.name = row.name;
                        req.session.subject = row.subject;
                        res.render('teacher',{name:req.session.name, subject:req.session.subject});
                    }    
            });
            if(!validate) res.end('Invalid username or password');
        });
    }
});

app.get('/turmas', (req, res) => {
    const sqlCommand = `SELECT * FROM student WHERE classroom='${req.query.turma}'`;
    console.log(sqlCommand);
    db.all(sqlCommand, (err, rows) => {
        if(err) {
            res.send("Not found");
        } else {
            let com = "<div><ul>\n"
            rows.forEach(function(row) {
                const name = row.name;
                const number = row.number;
                const grade = row.grade;
                com += "<li>" + name + " | " + number + " | " + grade  + "</li>";
            });
            com += "</ul></div>";
            res.render('search_result', {result:com});
        }
    });
});
var numbers=[];
app.get('/pautas',(req,res)=>{
    let sqlCommand = `SELECT * FROM student WHERE classroom='${req.query.ano}'`;
    
    db.all(sqlCommand, (err, rows) => {
        rows.forEach((row)=>{
        let com = "<div><ul>\n"
        let name = row.name
        const number = row.number;
        const gradeM = row.gradeM;
        const gradeP = row.gradeP;
        const gradeC = row.gradeC;
        com += "<li>" + name + " | " + number + " | " + gradeM + "|" + gradeP +" | " + gradeC  + "</li>";
        com += "</ul></div>";
        res.render('pautas', {result:com});
        numbers=[];
        })
    });
    
})

app.listen(port, () => {
    console.log("Server running on port " + port);
});