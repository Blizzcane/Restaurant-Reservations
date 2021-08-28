const knex = require("../db/connection");

function list() {
  return knex("tables").select("*");
}

function create(table) {
  return knex("tables").insert(table).returning("*");
}

function read(reservation_id) {
  return knex("reservations")
      .select("*")
      .where({ reservation_id: reservation_id })
      .first();
}

function readTable(table_id) {
  return knex("tables")
      .select("*")
      .where({ table_id: table_id })
      .first();
}

function seat(table_id, reservation_id) {
  // console.log("seating knex");
  console.log("service.seat:",table_id, reservation_id)
  return knex("tables")
    .where({ table_id: table_id })
    .update({ reservation_id: reservation_id, status: "occupied" });
}

function updateReservation(reservation_id, status) {
  return knex("reservations")
    .where({ reservation_id: reservation_id })
    .update({ status: status });
}

function cleanTable(table_id) {
  return knex("tables")
      .where({ table_id: table_id })
      .update({ reservation_id: null, status: "free" });
}

module.exports = {
  list,
  create,
  seat,
  updateReservation,
  read,
  readTable,
  cleanTable
};
