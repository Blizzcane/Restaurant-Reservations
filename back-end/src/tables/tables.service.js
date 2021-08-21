const knex = require("../db/connection");

function list() {
  return knex("tables").select("*");
}

function create(table) {
  return knex("tables").insert(table).returning("*");
}

function update(table) {
  return knex("tables")
    .where({ table_id: table.table_id })
    .update({ reservation_id: table.reservation_id, status: "occupied" });
}

module.exports = {
  list,
  create,
  update,
};
