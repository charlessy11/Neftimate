import axios from 'axios'
import 'dotenv/config'
import db from './db'

const { 
    COLLECTION_SLUG, 
    OPENSEA_API_KEY,
} = process.env;

// Endpoints for get calls (either collection or assets)
const endpoints = [
    `https://api.opensea.io/api/v1/collection/${COLLECTION_SLUG}`, 
    `https://api.opensea.io/api/v1/assets?collection_slug=${COLLECTION_SLUG}&limit=50`,
]

// Retrieves the initial data (collection and assets) from OpenSea 
const getOpenseaData = (cursor = null) => {
    const options = {
        headers: {
            'x-api-key': OPENSEA_API_KEY,
        }
    }

    //returns data from next set of 50 assets when cursor is not null
    if (cursor != null){
        return axios.get(`${endpoints[1]}&cursor=${cursor}`, options);
    }

    //otherwise, it returns data for collections and first 50 assets
    return Promise.all(endpoints.map(endpoint => axios.get(endpoint, options)))
}

// Parses assets data from the response to assets table row format accordingly
const parseAssets = (assets : Array<any>, collection_address: string): Array<Asset> | null => {

    if (!assets) throw new Error('Error: Assets are null')

    return assets.map(asset => ({
            id : asset.id,
            collection_address,
            traits : JSON.stringify(asset.traits),
            listing_date : asset.listing_date,
            name: asset.name,
            img_url : asset.image_url,
            rarity_score: 0,
        })
    )
}

// Parses collection data from the response to collections table row format accordingly
const parseCollection = (collection : any): Collection | null => {
    if(!collection) throw new Error('Error: Collection is null')
    
    return {
        name: collection.name,
        market_cap: collection.stats.market_cap,
        total_supply: collection.stats.total_supply,
        updated_at: new Date(),
        traits: collection.traits,
        slug: collection.slug,
        address: collection.primary_asset_contracts[0].address,
        img_url: collection.image_url,
    }
}

// Inserts collections data into collections table
const insertCollection = async (collection: Collection) => {
    await db("collections").insert(collection);
}

// Inserts assets data into assets table
const insertAssets = async (assets: Array<Asset>) => {
    await db('assets').insert(assets)
}

// Driver
(async () => {

    let data: any;

    // Gets initial data from opensea
    try {
        data = await getOpenseaData();
    } catch (error){
        console.error("Error getting opensea data: ", error);
        return;
    }
    

    // Parses collection data
    const collection = parseCollection(data[0].data.collection)
    if (collection?.address == null){
        console.log("Error parsing collection address, stopping...")
        return;
    }
    
    // Inserts collection data, if we get pkey conflict, just continue
    try {
        await insertCollection(collection)
    } catch (error: any){
        if (error.code == "23505"){
            console.log("Collection already imported.")
        } else {
            console.log('Error inserting into database: ', error)
        }
    } 

    // Uses cursor to iteratively call opensea /assets endpoint
    let cursor = data[1].data.next
    while (cursor != null) {
        console.log(`Fetching for cursor = ${cursor}`)

        // Gets data using cursor
        try {
            data = await getOpenseaData(cursor)
        } catch (error){
            console.log('Error getting opensea data: ', error)
            continue;
        }
        
        // Parses assets
        const assets = parseAssets(data.data.assets, collection?.address)
        if (!assets){
            console.log("Error parsing assets")
            return;
        }

        // Inserts assets into database, if already imported continue
        try {
            await insertAssets(assets)
        } catch (error: any){
            if (error.code == "23505"){
                console.log("Assets already imported.")
            } else {
                console.log('Error inserting assets into database: ', error)
            }
            
        } finally {
            cursor = data.data.next
            // await new Promise(r => setTimeout(r, 200)); // Uncomment if ratelimited
        }
    }
    db.destroy();
    console.log("Completed importing assets")

})()