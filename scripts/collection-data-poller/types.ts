interface Collection {
    id: string
    name: string
    market_cap: number
    total_supply: number
    updated_at: Date
    traits: Array<Object>
    slug: string
    contract_address: string
    image_url: string
}


interface Asset {
    id: string
    collection_id: string
    traits: Array<Object>
    listing_date: Date
    name: string 
    rarity_score: number
    image_url: string
}