const connectToMongo = require('./db');

const express = require('express')
const app = express()
const port = 3000

connectToMongo();
// avaliable routes
app.use('/api/auth',require('./routes/auth'))

// app.use('/api/notes',require('./routes/notes'))


/*
demonstration of app.get 

app.get('/', (req, res) => {
  res.send('Hello icharlie')
})
*/
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

