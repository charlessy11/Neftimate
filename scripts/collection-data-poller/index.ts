import axios from 'axios'
import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid';
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


const parseResponse = (response: Array<any>) => {
    if (response == null) return {}

    const colllectionId = uuidv4();
    const collection = parseCollection(response[0].data.collection, colllectionId)
    const assets = parseAssets(response[1].data.assets, colllectionId)

    return {
        collection,
        assets
    }
}


// Parses assets from the response
const parseAssets = (assets : Array<any>, collectionId: string): Array<Asset> | null => {

    if (!assets) return null

    return assets.map(asset => ({
            id : asset.id,
            collection_id : collectionId,
            traits : asset.traits,
            listing_date : asset.listing_date,
            name: asset.name,
            img_url : asset.image_url,
            rarity_score: 0,
        })
    )
}


const parseCollection = (collection : any, colllectionId: string): Collection | null => {
    if(!collection) return null
    
    return {
        id: colllectionId,
        name: collection.name,
        market_cap: collection.stats.market_cap,
        total_supply: collection.stats.total_supply,
        updated_at: new Date(),
        traits: collection.traits,
        slug: collection.slug,
        contract_address: collection.primary_asset_contracts[0].address,
        img_url: collection.image_url,
    }
}

const insertCollection = async (collection: Collection) => {
    await db("collections").insert(collection).onConflict("name").merge();
}

const insertAssets = async (assets: Array<Asset>) => {
    console.log(assets[0].traits)
    assets.forEach(asset => {console.log(asset)})
    const query = db('assets').insert([ ...assets ])
    console.log(query);
}

(async () => {

    const data = await getOpenseaData();
    if (!data){
        console.error("No data received from opensea")
        return;
    }
    
    const { collection, assets } = parseResponse(data);
    if (!collection || !assets) {
        console.error("Error parsing data")
        return;
    }

    try {
        await insertCollection(collection)
        await insertAssets(assets)
    } catch (error){
        console.log('Error inserting into database: ', error)
        return;
    }

})()