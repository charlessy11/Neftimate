/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.raw(
    `
    ALTER TABLE collections 
    ADD COLUMN last_pulled_transactions_at timestamp DEFAULT NULL;
    `)
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(
    `
    ALTER TABLE collections
    REMOVE COLUMN last_pulled_transactions_at;
    `)
};
