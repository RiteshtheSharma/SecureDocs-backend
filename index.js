const connectToMongo = require('./db');
const createBucket = require("./Bucket")
const cors = require('cors')
const express = require('express')
const app = express()
require ('custom-env').env('local')



connectToMongo();


//middleware to deal with json and use req.body if bellow code is not used then req.body wiill bu undefined
app.use(express.json())

//The express.urlencoded() function is a built-in middleware function in Express. It parses incoming requests with URL-encoded payloads and is based on a body parser.
//You NEED express.json() and express.urlencoded() for POST and PUT requests
//Now make a POST request to http://localhost:3000/ with header set to ‘content-type: application/x-www-form-urlencoded’ and body {“name”:”GeeksforGeeks”},

app.use(express.urlencoded({
  extended: false
}));

//enable cors request for all resources
app.use(cors())
const path = require('path')

// avaliable routes

app.use('/public',express.static(path.join(__dirname,'public')));



app.use('/api/auth',require('./routes/auth'))

app.use('/api/folder',require('./routes/folder'))
app.use('/api/file',require('./routes/file'))


app.use('/api/lockUnlockFile',require('./routes/fileLockUnlock'));

/*
demonstration of app.get 
 
send string (Hello icharlie)on web page with url http://localhost:3000
app.get('/', (req, res) => {
  res.send('Hello icharlie')
})
send string (Hello icharlie)on web page url http://localhost:3000
router.get('/',(req,res)=>{
    obj={
        a:'thios'
    }
    res.json(obj)
    })
*/
app.listen(process.env.port, () => {
  console.log(`Example app listening at http://localhost:${process.env.port}`)
})

