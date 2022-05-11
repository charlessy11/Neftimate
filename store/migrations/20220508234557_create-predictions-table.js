/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(
    `
    CREATE TABLE predictions (
        id uuid DEFAULT uuid_generate_v4(),
        asset_id VARCHAR (255) NOT NULL REFERENCES assets(id),
        prediction DOUBLE PRECISION,
        confidence DOUBLE PRECISION,
        PRIMARY KEY (id)
    )
    `
  )
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

};
