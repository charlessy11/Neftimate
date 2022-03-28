import axios, { AxiosResponse } from 'axios'
import { assert } from 'console';
import 'dotenv/config'
import db from './db'

const { 
    COLLECTION_SLUG, 
    OPENSEA_API_KEY,
} = process.env;

const endpoints = [
    `https://api.opensea.io/api/v1/collection/${COLLECTION_SLUG}`, 
    `https://api.opensea.io/api/v1/assets?collection_slug=${COLLECTION_SLUG}`,
]

const getOpenseaData = async () => {
    let res;

    const options = {
        headers: {
            'x-api-key': OPENSEA_API_KEY,
        }
    }

    try {
        res = await Promise.all(endpoints.map(endpoint => axios.get(endpoint, options)))
    } catch (error) {
        console.error(error)
    }

    return res
}


const parseResponse = (response: Array<any>) =>   {
    if (response == null) return {}

    console.log("resp: ", response[0])

    const collection = parseCollection(response[0])
    const assets = parseAssets(response[1], '1')

    return {
        collection,
        assets
    }
}


// Parses assets from the response
const parseAssets = (assets : Array<any>, collectionId: string) => {
    console.log("assets", assets)

    if (!assets) return {}

    const parsed: Array<Object> = []
    assets.map(asset => {
        parsed.push({
            id : asset.id,
            collection_id : collectionId,
            traits : asset.traits,
            listing_date : asset.listing_date,
            name: asset.name,
            img_url : asset.image_url
        })
    })

    console.log("PARSED: ", parsed);
}

//Parses collections from the response
const parseCollection = (collections: Array<any>) => {
    console.log("collections: ", collections);

    if(!collections) return {}

    const parsed : Array<Object> = []
    collections.map(collection => {
        parsed.push({
            name : collection.name,
            market_cap : collection.market_cap,
            total_supply : collection.total_supply,
            updated_at : collection.updated_at,
            traits : collection.traits,
            slug : collection.slug,
            contract_address : collection.contract_address,
            img_url : collection.img_url
        })
    })
}


const insertIntoDB = (con: any, assetData: Array<Asset>, collectionData: Collection) => {
    con.query("INSERT INTO assets (asset_id, collection_id, traits, listing_date, name, img_url) VALUES ?", assetData.entries)
}

(async () => {

    // 1. Get data
    // 2. Parse data into types
    // 3. Insert data into database
    
    const data = await getOpenseaData();
    if (!data){
        throw new Error("No data received from opensea")
    }
    
    const parsed = parseResponse(data);
    console.log(`PARSED COLLECTIONS: ${JSON.stringify(parsed.collection)}`)
    console.log(`PARSED Asset: ${JSON.stringify(parsed.assets)}`)

    // console.log(`TEST: ${JSON.stringify(data)}`);
})()