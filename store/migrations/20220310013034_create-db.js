/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
    return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('collections', table => {
        table.uuid('id').primary()
        table.string('name')
        table.double('market_cap')
        table.double('total_supply')
        table.timestamp('updated_at')
        table.jsonb('traits')
        table.string('slug')
        table.string('contract_address')
        table.string('img_url')
    })
    .createTable('assets', table => {
        table.string('id').primary().notNullable()
        table.uuid('collection_id')
        table.foreign('collection_id').references('collections.id')
        table.jsonb('traits')
        table.timestamp('listing_date')
        table.string('name').notNullable()
        table.double('rarity_score')
        table.string('img_url')
    })
    .createTable('sales', table => {
        table.uuid('id').primary().notNullable()
        table.double('price').notNullable()
        table.string('asset_id').notNullable()
        table.foreign('asset_id').references('assets.id')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
};
