import express from 'express'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDoc from './swagger.json'
import httpStatus from 'http-status-codes'
import db from './db'

const app = express()
const port = 3000


// GET Prediction
app.get('/prediction/:id', (req, res) => {

    const asset_id = req.params.id

    db('predictions').where({ asset_id: asset_id }).then((rows: any) => {
        if (rows.length == 0){
            res.status(httpStatus.BAD_REQUEST).send({error: `No predictions for asset id ${asset_id}`})
            return;
        }
        res.status(httpStatus.OK).send(rows.map((row: any) => ({
            asset_id: row.asset_id,
            prediction: row.prediction,
            confidence: row.confidence,
        })))
    })
    .catch((error: any) => {
        console.error(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: `Internal Server Error`})
    })
})

// GET /collections -> returns all available collections
app.get('/collections', (req, res) => {
    db('collections').then((rows: any) => {
        res.status(httpStatus.OK).send(rows)
    })
    .catch((error: any) => {
        console.error(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: "Internal Server Error"})
    })
})

// GET Collection assets by slug QP: limit
app.get('/collections/:slug', (req, res) => {
    const slug = req.params.slug
    let limit = 50

    if (req.query.limit && typeof(req.query.limit) == 'string'){
        limit = isNaN(parseInt(req.query.limit)) ? 50 : parseInt(req.query.limit)
    }

    if (limit > 50 || limit < 0){
        res.status(405).send({error: "Limit parameter must be greater than 0 and less than 50"})
        return;
    }

    const columns = ['id', 'traits', 'name', 'rarity_score', 'img_url', 'collection_address']

    db('collections').select('address').where({slug: slug})
        .then((rows: any) => {
            if (rows < 1){
                res.status(410).send({error: "Collection not found"})
                return;
            }
            return rows[0].address
        })
        .then((address: string ) => {
            db('assets').select(columns).where({collection_address: address}).limit(limit)
            .then((rows: any) => {
                console.log(address)
                res.status(httpStatus.OK).send(rows)
            })
        })
        .catch((error: any) => {
            console.error(error)
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: "Internal Server Error"})
        })
})


// GET /assets limit: int ->  returns all assets
app.get('/assets', (req, res) => {

    let limit = 50;

    if (req.query.limit && typeof(req.query.limit) == 'string'){
        limit = isNaN(parseInt(req.query.limit)) ? 50 : parseInt(req.query.limit)
    }

    if (limit > 50 || limit < 0){
        res.status(httpStatus.BAD_REQUEST).send({error: "Limit parameter must be greater than 0 and less than 50"})
    }

    db('assets').select(['id', 'traits', 'name', 'img_url', 'rarity_score', 'collection_address']).limit(limit).then((rows: any) => {
        res.status(httpStatus.OK).send(rows);
    })
    .catch((error: any) => {
        console.error(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: "Internal Server Error"})
    }) 

})

// GET /assets/id
app.get("/assets/:id", (req, res) => {
    const assetId = req.params.id
    const columns = ['id', 'traits', 'name', 'rarity_score', 'img_url', 'collection_address']

    db('assets').select(columns).where({id: assetId}).then((rows: any) => {
        res.status(httpStatus.OK).send(rows)
    })
    .catch((error: any) => {
        console.error(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: "Internal Server Error"})
    })
}) 

// GET /assets/id/sales -> Gets sales information stats on an nft by id
app.get("/assets/:id/sales", (req, res) => {
    const assetId = req.params.id

    db('sales').select(['price', 'asset_id', 'timestamp']).where({asset_id: assetId}).then(((rows: any) => {
        res.status(httpStatus.OK).send(rows)
    }))
    .catch((error: any) => {
        console.error(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: "Internal Server error"})
    })
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.listen(port, () => {
    console.log('Example app listening on port ', port)
}) 