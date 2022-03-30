interface Collection {
    address: string
    name: string
    market_cap: number
    total_supply: number
    updated_at: Date
    traits: Array<Object>
    slug: string
    img_url: string
}


interface Asset {
    id: string
    collection_address: string
    traits: string
    listing_date: Date
    name: string 
    rarity_score: number
    img_url: string
}