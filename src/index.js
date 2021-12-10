const express = require('express')
const users = require('./routes/users')
const tasks = require('./routes/tasks')
require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(users)
app.use(tasks)

app.listen(port, () => {
    console.log('Server is up on port ', port);
})

