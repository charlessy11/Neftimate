// import {Handler} from 'aws-lambda'
// import axios, { AxiosRequestConfig } from 'axios'
// import 'dotenv/config'
// import db from './db'

const { 
    OPENSEA_API_KEY,
} = process.env;

// // Runs once a day to import transaction data for each asset of a collection

// // 1. Get collections in collections table
// // 2. Make call to opensea using colection_slug=, event_type=successful, occurred_after = (previous day timestamp if no transactions exist with that collection slug)
// // 3. Page over cursor and insert transactions into db with foreign key reference to assets table


// const getCollectionsFromDb = () => {
//     return db('collections').select('slug')
// }

// const getOpenseaData = async (collectionSlug: string, eventType='successful', occurred_after = null) => {
//     // var config: AxiosRequestConfig = {
//     //     method: 'get',
//     //     url: 'https://api.opensea.io/api/v1/events',
//     //     headers: { 
//     //       'x-api-key': OPENSEA_API_KEY, 
//     //     },
//     //     params: {
//     //         collection_slug: 'the-crypto-chicks',
//     //         event_type: 'successful',
//     //     }
//     //   };

//     let response;

//     try {
//         response = await axios.get('https://api.opensea.io/api/v1/events?collection_slug=the-crypto-chicks', {
//             headers: {
//                 'x-api-key': OPENSEA_API_KEY,
//                 "Access-Control-Allow-Origin": "*", // Required for CORS support to work
//                 "Access-Control-Allow-Credentials": true
//             }
//         })
//         console.log(response)
//     } catch (error){
//         console.log(error)
//         db.destroy()
//         console.log("ERROR")
//     }
//     return response
// }

// export const handler: Handler = async (event, context) => {
//     console.log(`EVENT: ${JSON.stringify(event)}`)

//     let collections;
//     let data;
//     let response;

//     try {
//         data = await getCollectionsFromDb()
//         collections = data.map((collection: any) => collection.slug)
//         console.log(collections)
//         response = await getOpenseaData(collections[0])
//         console.log(response)
//     } catch (error){   
//         console.error(error);
//         return;
//     }

//     // collections.forEach(async (collection: string) => {
//     //     console.log(`Getting data for ${collection}`)
        
//     // })


// }

import axios from 'axios';

export const handler = async () => {
    try {
        const url = 'https://api.opensea.io/api/v1/events?collection_slug=the-crypto-chicks';

        const response = await axios.get(url, { timeout: 10000, headers: {'x-api-key': OPENSEA_API_KEY, 'user-agent': 'PostmanRuntime/7.28.0', 'Accept': 'application/json', 'authority': 'api.opensea.io' } });
        console.log(typeof (response));
        console.log(response);

    } catch (e) {
        console.log(e, "error api call");
    }
}