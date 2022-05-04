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

const getLastSaleTimestamp = () => {
    return db('sales').select('timestamp').orderBy('timestamp', 'desc').first()
}

// Constructs axios request
const getOpenseaData = async (collectionSlug: string, cursor: string, occurred_after: Date | null, eventType='successful') => {
    
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

// Parses Axios response into an array of parsed events
const parseResponse = (response: AxiosResponse): Array<ParsedEvent> => {
    if (!response) return [];

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

export const handler: Handler = async (event) => {

    let collections: Array<{slug: string}> = [];
    let dbCollections;
    let dblatestTimestamp: {timestamp: Date};
    let latestTimestamp: Date | null;

    // Get data from db
    try {
        dbCollections = await getCollectionsFromDb()
        dblatestTimestamp = await getLastSaleTimestamp();
        console.log(dblatestTimestamp)
        latestTimestamp = new Date()
    } catch (error){
        console.error("ERROR GETTING COLLECTIONS DATA FROM DB", error)
        db.destroy()
        return
    }

    latestTimestamp = !dblatestTimestamp ? null : dblatestTimestamp.timestamp
    
    // Loop over and add collection name to collections array
    dbCollections.forEach((collection: any) => collections.push({
        slug: collection.slug
    }))

    
    // Loop over collections, perform functions on each collection
    collections.forEach(async (collection: any) => {
        console.log(`Getting data for ${collection.slug}, last collected data at ${latestTimestamp}`)

        let response, cursor : any;
        let parsedEvents: Array<ParsedEvent>;

        try {
            response = await getOpenseaData(collection.slug, "", latestTimestamp)
            parsedEvents = parseResponse(response)

            if (parsedEvents.length == 0){
                console.log("No events to update")
                db.destroy()
                return;
            }

            console.log(parsedEvents)
            await insertSalesIntoDb(parsedEvents)
            cursor = response.data.next
        } catch (error: any) {
            if (error.code == 23505){
                console.log("Duplicate key, continuing")
            } else {
                console.log("ERROR GETTING RESPONSE FROM OPENSEA: ", error)
                db.destroy()
                return
            }
        }
        
        try {
            while (cursor != null){
                response = await getOpenseaData(collection.slug, cursor, latestTimestamp)
                parsedEvents = parseResponse(response)
                try {
                    await insertSalesIntoDb(parsedEvents)
                } catch (error: any){
                    if (error.code == 23505){
                        console.log("Duplicate key, continuing")
                    } else if (error.code == 23503){
                        console.log("Sales information for this asset doesn't exist, try updating the assets table")
                    }
                }
                cursor = response.data.next
            }
        } catch (error: any) {
            console.error("Error getting/inserting data into database: ", error)
            return;
        } finally {
            db.destroy()
            console.log("Done :)")
        }
    })

}

const getPriceFromDecimal = (decimal: number, price: number) => {
    return price / (1*10**decimal)
}