const express = require('express');
const crypto = require('crypto');

const nodemailer = require('nodemailer');
const fs = require('fs')
const multer = require("multer");
const path= require('path')
const router = express.Router() 
const storage = multer.diskStorage(
  {
      destination:function(req,file,cb){
         console.log(req.folder,req.user)
          if(!fs.existsSync('uploads')){
              fs.mkdirSync('uploads')
          }
         
          console.log("in multer middleware",file)
         
          cb(null,`uploads`)
      },
      filename:function(req,file,cb){
          
cb(null,file.originalname)
      }
  }
)


const upload = multer({
  storage
});


router.post('/decrypt', upload.single('file'),async(req,res)=>{

 const inputFile = req.file.path;
    const outputFile = `temp${req.file.filename.slice(req.file.filename.indexOf('.'))}`;
    const password = req.body.password;
 
    try{ console.log(outputFile,path.dirname(__dirname)," fkfkoko"  )
      await unzipFile(inputFile, outputFile, password);
    const options = {
      root: path.join(path.dirname(__dirname))
    };
  
    const fileName = outputFile
   
    res.sendFile(fileName, options, function (err) {
      if (err) {
        console.log("Error : ",err);
      } else {
        console.log('Sent:', fileName);
        fs.unlink(inputFile, (err) => {
          if (err) console.error(err);
        });
        fs.unlink(outputFile, (err) => {
          if (err) console.error(err);
        });
      }
    });
  }
  catch(err){
    console.error(err);
    res.status(500).send('Error :',err);
    fs.unlink(inputFile, (err) => {
      if (err) console.error(err);
    });
    fs.unlink(outputFile, (err) => {
      if (err) console.error(err);
    });
  }


})
router.post('/encrypt', upload.single('file'), async (req, res) => {
  const inputFile = req.file.path;
 
  const outputFile = `locked-${req.file.filename}`;
  const password = req.body.password;
  console.log(password,inputFile)
  

  createZipFile(inputFile, outputFile, password)
    .then(async () => {
    
      const options = {
        root: path.join(path.dirname(__dirname))
      };
    
      const fileName = outputFile
     
      res.sendFile(fileName, options, function (err) {
        if (err) {
          console.log("Error : ",err);
        } else {
          console.log('Sent:', fileName);
          fs.unlink(inputFile, (err) => {
            if (err) console.error(err);
          });
          fs.unlink(outputFile, (err) => {
            if (err) console.error(err);
          });
        }
      });
   
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error creating zip file.');
    });
    
});


function unzipFile(inputFile, outputFile, password){
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);
   
const  key = crypto.createHash('sha256').update(password).digest()
                    

const iv = crypto.createHash('md5').update(password).digest()

    const cipher = crypto.createDecipheriv('aes-256-cbc', key,iv);
    input.pipe(cipher).pipe(output);

    output.on('finish', function() {
      
      console.log(
        'archiver has been finalized and the output file descriptor has closed.'
      );
      resolve();
    });

    // archive.on('error', function(err) {
    //   reject(err);
    // });

    // archive.pipe(cipher).pipe(output);

    // archive.file(inputFile, { name: 'file' });
    // archive.finalize();
  });


}
function createZipFile(inputFile, outputFile, password) {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);
   
const  key = crypto.createHash('sha256').update(password).digest()
                    

const iv = crypto.createHash('md5').update(password).digest()

    const cipher = crypto.createCipheriv('aes-256-cbc', key,iv);
    input.pipe(cipher).pipe(output);

    output.on('finish', function() {
      
      console.log(
        'archiver has been finalized and the output file descriptor has closed.'
      );
      resolve();
    });

    // archive.on('error', function(err) {
    //   reject(err);
    // });

    // archive.pipe(cipher).pipe(output);

    // archive.file(inputFile, { name: 'file' });
    // archive.finalize();
  });
}


 module.exports = router