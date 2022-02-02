var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('users.db')

db.serialize(function () {

  // Questions for teachers table
  db.run("CREATE TABLE questions (username INT, content TEXT, teacher TEXT)");

  //TEACHERS TABLE
  db.run("CREATE TABLE teacher (username TEXT, password TEXT,name TEXT,subject TEXT,userid INT)");

  db.run("INSERT INTO teacher (username,password,name, subject,userid) VALUES ('albert_ast','1234','Alberto Astuto','Physics','1')");
  db.run("INSERT INTO teacher (username,password,name, subject,userid) VALUES ('jjtom','4567','João José Tomate','Chimestry','2')");
  db.run("INSERT INTO teacher (username,password,name, subject,userid) VALUES ('rendesca','8910','Renan Descalço','Maths','3')");
  db.run("INSERT INTO teacher (username,password,name, subject,userid) VALUES ('admin','12345','ADMIN','Maths','0')");
  

  //STUDENTS TABLE

  db.run("CREATE TABLE student (username TEXT, password TEXT,name TEXT,number TEXT, classroom TEXT, gradeM INT, gradeP INT, gradeC INT, userid INT, saldo INT)");

  db.run("INSERT INTO student (username,password, name, number,classroom, gradeM, gradeP, gradeC, userid,saldo) VALUES ('danielbueeno','1112','Daniel Bueno', '666','10', 20, 20, 20, 4, 1000)");
  db.run("INSERT INTO student (username,password, name, number,classroom, gradeM, gradeP, gradeC, userid,saldo) VALUES ('rafaelpereira','1314','Rafael Pereira', '777','11', 20, 20, 10, 5, 1000)");
  db.run("INSERT INTO student (username,password, name, number,classroom, gradeM, gradeP, gradeC, userid,saldo) VALUES ('denisyamunaque','1415','Denis Yamunaque', '888','12', 18, 15, 10, 6, 1000)");
  db.run("INSERT INTO student (username,password, name, number,classroom, gradeM, gradeP, gradeC, userid,saldo) VALUES ('diogoaguiar','81020','Diogo Aguiar', '999','12', 18, 15, 10, 7, 1000)");

  //Grades TABLE

  db.run("CREATE TABLE pautas (number TEXT, gradeMath INT, gradePhys INT, gradeChe INT)");
  db.run("INSERT INTO pautas (number, gradeMath, gradePhys, gradeChe) VALUES ('666','20', '15','10')");
  db.run("INSERT INTO pautas (number, gradeMath, gradePhys, gradeChe) VALUES ('999','18', '15','10')");
  db.run("INSERT INTO pautas (number, gradeMath, gradePhys, gradeChe) VALUES ('777','10', '9','18')");
  db.run("INSERT INTO pautas (number, gradeMath, gradePhys, gradeChe) VALUES ('888','5', '2','10')");

});

db.close();