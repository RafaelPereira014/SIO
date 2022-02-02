const express = require('express');
const router = express.Router();
const fs = require('fs');

const studentDB = require('../models/student.json');
const classDB = require('../models/class.json');
const subjectDB = require('../models/subject.json');


const urlEncoded = express.urlencoded({extended: false});

let userId;
let cl;

//Student profile
router.get('/:studentId',(req,res)=>{
    userId = req.params.studentId;
    let student =getStudent(userId);

    for(let c of classDB){
        c.students.forEach(stu =>{
            if(stu == userId){
                cl = c.name;
            }
        });
    }
    
    res.render('student/index',{
        student: student,
        cl: cl
    });;
 
});

//New Tuition fee payment
router.get('/:studentId/tuitionpayment',(req,res)=>{
    let student = getStudent(userId);
    res.render('student/tuitionpayment',{student: student});
});

router.post('/:studentId/tuitionpayment',urlEncoded,(req,res)=>{
    let value = req.body.feeValue;
    let indexST = 0;
    let student = getStudent(userId);;
    for(let s of studentDB){
        if(s.userid == userId){
           break;
        }
        indexST++;
    }
    let fileReaded = fs.readFileSync('./models/student.json', 'utf-8');
    let objectFile = JSON.parse(fileReaded);

    objectFile[indexST].credit -= value;
    objectFile[indexST].indebtedness -= value;
    fs.writeFile('./models/student.json',JSON.stringify(obj, null,2),err=>{
        if(err) console.log(err);
    });

    res.redirect(`/student/${student.userid}`);
});

//Grades
router.get('/grades/:subjectid',(req,res)=>{
    let student=getStudent(userId);
    let subjectId = req.params.subjectid;
    let subname;
    let indexSb = 0;

    let fileReaded = fs.readFileSync('./models/student.json', 'utf-8');
    let objectFile = JSON.parse(fileReaded);

//    for(let stu of objectFile){
//        if(stu.userId == userId){
//            student = stu;
//        }
//    }
   for(let sbj of subjectDB){
       if(sbj.subjectId == subjectId){
            subname = sbj.name;
       }
   }
   for(let sbj of student.grades){
       if(sbj.subject == subname){
           break;
       }
       indexSb++;
   }

    res.render('student/grades', {student: student, index: indexSb});
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