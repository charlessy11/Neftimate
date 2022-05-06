import express from 'express'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDoc from './swagger.json'

const app = express()
const port = 3000




app.get('/', (req, res) => {
    res.send("Hello world")
})


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.listen(port, () => {
    console.log('Example app listening on port ', port)
})