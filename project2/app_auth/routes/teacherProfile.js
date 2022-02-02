const express = require('express');
const teacherDB = require('../models/teacher.json');
const classDB = require('../models/class.json');
const subjectDB = require('../models/subject.json');
const studentDB = require('../models/student.json');
const router = express.Router();
const fs = require('fs');

const urlEncoded = express.urlencoded({extended: false});

let userId;
let user;
//Teacher profile
router.get('/:teacherId',(req,res)=>{
     userId = req.params.teacherId;
    
    let name = null;
    let subject = null;

    for(let teacher of teacherDB){
        if(teacher.userid == userId){
            user = teacher;
            name = teacher.name;
            subject = teacher.subject;
            break;
        }
    }
    res.render('teacher/index',{
        name: name,
        subject: subject
    });
 
});
//Students 10th year
router.get('/students/:classid',(req,res)=>{
    const yearC = req.params.classid;
    let cl = {}; //class
    let students = [];

    for(let c of classDB){
        if(c.classId == yearC){
            cl = c;
            break;
        }
    }
    cl.students.forEach(student => {
        for(let studentData of studentDB){
            if(studentData.userid == student){
                students.push(studentData)
            }
        }
    });
    res.render('teacher/students',{name : cl.name, students: students, userid: userId});
});

//Student data
router.get('/student/:studentid',(req,res)=>{
    let studentId = req.params.studentid;
    let student = getStudent(studentId);
    let teacher = getTeacher(userId);
    let g;
    
    //get the grades
    for(let subg of student.grades){
        if(subg.subject == teacher.subject){
            g = subg;
            break;
        }
    } 
    let grades = g;
    res.render('teacher/student',{student: student, grades: grades})
});

router.post('/student/:studentid',urlEncoded, (req, res)=>{
    const studentId = req.params.studentid;
    let student = getStudent(studentId);
    let grades = null;
    const semester = req.body.semester;
    const test = req.body.test;
    const grade = req.body.grade;
    let subject = null;
    let indexSt = 0;
    let indexSb = 0;

    //get the student
    for(let s of studentDB){
        if(s.userid == studentId){
            break;
        }
        indexSt += 1;
    }
    
    
    //get the grades
    if(user!= null){
       for(let subg of student.grades){
            if(subg.subject == user.subject){
                grades = subg;
                break;
            }
            indexSb += 1;
        } 
    }

    readFile('./models/student.json',(err,data)=>{
        if(err){
            console.log(err);
        }
        if(semester === "first"){
            switch(test){
                case "test1":
                    data[indexSt].grades[indexSb].first_semester[0].test1= grade;
                    break;
                case "test2":
                    data[indexSt].grades[indexSb].first_semester[1].test2= grade;
                    break;
                case "test3":
                    data[indexSt].grades[indexSb].first_semester[2].test3= grade;
                    break;
            }
            
        }else{
            switch(test){
                case "test1":
                    data[indexSt].grades[indexSb].second_semester[0].test1= grade;
                    break;
                case "test2":
                    data[indexSt].grades[indexSb].second_semester[1].test2= grade;
                    break;
                case "test3":
                    data[indexSt].grades[indexSb].second_semester[2].test3= grade;
                    break;
            }
        }
        fs.writeFile('./models/student.json',JSON.stringify(data, null,2),err=>{
            if(err) console.log(err);
        });
    });

    
    res.redirect(`/teacher/${user.userid}`);

});

//Aux Functions
function getStudent(studentid){
    let student;
    for(let s of studentDB){
        if(s.userid == studentid){
            student = s;
            break;
        }
    }
    return student;
}
function getTeacher(teacherid){
    let teacher;
    for(let t of teacherDB){
        if(t.userid == teacherid){
            teacher = t;
            break;
        }
    }
    return teacher;
}
function readFile(filePath,cb){
    fs.readFile(filePath,'utf-8',(err,FileData)=>{
        if(err){
            return cb && cb(err);
        }
        try{
            const object = JSON.parse(FileData);
            return cb && cb(null, object);
        }catch(err){
            return cb && cb (err);
        }
    });
}

module.exports = router;