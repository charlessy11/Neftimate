// Runs once a day to import transaction data for each asset of a collection

import {Handler} from 'aws-lambda'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import db from './db'
import 'dotenv/config'

const { OPENSEA_API_KEY } = process.env

const getCollectionsFromDb = () => {
    return db('collections').select('slug', 'last_pulled_transactions_at')
}

// Inserts sales into database
const insertSalesIntoDb = (events: Array<ParsedEvent>) => {
    return db('sales').insert(events)
}

// Updates db with when collection last had transactions pulled
const updateLastUpdatedTime = (slug: string) => {
    return db('collections').update({'last_pulled_transactions_at': 'now()'}).where('slug', slug)
}

// Constructs axios request
const getOpenseaData = async (collectionSlug: string, cursor: string, occurred_after: Date, eventType='successful') => {
    
    var config: AxiosRequestConfig = {
        method: 'get',
        url: 'https://api.opensea.io/api/v1/events',
        headers: { 
          'x-api-key': OPENSEA_API_KEY, 
        },
        params: {
            collection_slug: collectionSlug,
            event_type: eventType,
            cursor: cursor,
        }
      };

      if (occurred_after){
        config.params = {
            ...config.params,
            occurred_after: occurred_after,
        }
      }
      
    return axios(config)
}

const parseResponse = (response: AxiosResponse): Array<ParsedEvent> => {
    return response.data.asset_events.map((event: any) => {
        if (!event.asset){
            return;
        }

        return {
            id: event.id,
            price: getPriceFromDecimal(event.payment_token.decimals, event.total_price),
            asset_id: event.asset.id,
            timestamp: event.transaction.timestamp,
        }
    })
}

// const getParseAndInsertEvents = (slug: string, collection: any) => {
//     let response: any = getOpenseaData(collection.slug, "", collection.updated_at).then(res => res).catch(console.error)
//     let cursor = response.data.next
    


// }

export const handler: Handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`)

    let collections: Array<{slug: string, updated_at: string}>= [];
    let data;

    try {
        data = await getCollectionsFromDb()
    } catch (error){
        console.error("ERROR GETTING COLLECTIONS DATA FROM DB", error);
        return
    }
    
    data.forEach((collection: any) => collections.push({
        slug: collection.slug,
        updated_at: collection.last_pulled_transactions_at
    }))
    

    // build collections promise.all into array of 4, return result
    collections.forEach(async (collection: any) => {
        console.log(`Getting data for ${collection.slug}, last updated at ${collection.updated_at}`)

        let response = await getOpenseaData(collection.slug, "", collection.updated_at)
        let cursor = response.data.next;

        while (cursor != null){
            try {
                console.log(`Getting data for ${cursor}`)
                response = await getOpenseaData(collection.slug, cursor, collection.updated_at)
                cursor = response.data.next
            } catch (error){
                console.error(`ERROR FETCHING DATA FOR ${cursor}, exiting`)
                db.destroy()
                break;
            }

            const parsedEvents = parseResponse(response);

            try {
                await insertSalesIntoDb(parsedEvents);
            } catch (error) {
                console.error(`ERROR INSERTING SALES DATA INTO DB: ${error}`)
                continue;
            }
        }    
    })


    // collections.forEach(async (collection: any) => {
    //     try {
    //         await updateLastUpdatedTime(collection.slug)
    //     } catch (error) {
    //         console.error(`ERROR UPDATE last_pulled_transactions_at IN DB: ${error}`)
    //     }    
    // })


}

const getPriceFromDecimal = (decimal: number, price: number) => {
    return price / (1*10**decimal)
}