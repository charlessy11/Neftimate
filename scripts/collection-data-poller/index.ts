import axios from 'axios'
import { json } from 'node:stream/consumers';
import * as getAssetsRes from './responses/getAssets.json'


const { COLLECTION_SLUG } = process.env;

const getCollectionData = async () => {
    let res;
    try {
        res = await axios.get(`https://api.opensea.io/api/v1/assets?collection_slug=${COLLECTION_SLUG}`)
    } catch (error) {
        res = 'nokey'
    }

    // Call function to parse data here
    const parsed = parseResponse(res) 

    return parsed

}

const parseResponse = (response: any) => {
    if (response == 'nokey'){
        response = getAssetsRes
    }

    if (response == null) return {}

    parseAssets(response.assets)


    return response

}

const parseAssets = (assets : Array<any>) =>{
    //loop thru assets
    assets.map(asset => {
        // console.table(asset)
        console.log(asset.id);
        console.log(asset.collection_id) //no collection_id in response
        console.log(asset.traits)
        console.log(asset.listing_date)
        console.log(asset.name)
        console.log(asset.img_url)
    })
}


(async () => {
    const data = await getCollectionData();
    // console.log(`TEST: ${JSON.stringify(data)}`);
})()