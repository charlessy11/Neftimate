/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(
    `
    ALTER TABLE collections RENAME COLUMN contract_address TO address; 
    ALTER TABLE assets DROP COLUMN collection_id;
    ALTER TABLE assets ADD COLUMN collection_address VARCHAR(255) NOT NULL;
    ALTER TABLE collections DROP CONSTRAINT collections_pkey;
    ALTER TABLE collections DROP COLUMN id;
    ALTER TABLE collections ADD PRIMARY KEY (address);
    ALTER TABLE assets
	ADD CONSTRAINT fk_collection_address FOREIGN KEY (collection_address) REFERENCES collections(address);
 `)
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE assets
        DROP CONSTRAINT fk_collection_address FOREIGN KEY (collection_address) REFERENCES collections(address)
        ALTER TABLE collections DROP PRIMARY KEY (address);
        ALTER TABLE collections ADD COLUMN id;
        ALTER TABLE collections ADD CONSTRAINT collections_pkey;
        ALTER TABLE assets DROP COLUMN collection_address;
        ALTER TABLE assets ADD COLUMN collection_id;
        ALTER TABLE collections RENAME COLUMN address TO contract_address; 
  `)
};
