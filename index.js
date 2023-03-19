const connectToMongo = require('./db');
const cors = require('cors')
const express = require('express')
const app = express()
const port = 1000

connectToMongo();

//middleware to deal with json and use req.body if bellow code is not used then req.body wiill bu undefined
app.use(express.json())

//enable cors request for all resources
app.use(cors())
// avaliable routes

app.use('/api/auth',require('./routes/auth'))

app.use('/api/note',require('./routes/note'))


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
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

