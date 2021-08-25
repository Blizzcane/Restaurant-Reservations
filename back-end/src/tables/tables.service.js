const knex = require("../db/connection");

function list() {
  return knex("tables").select("*");
}

function create(table) {
  return knex("tables").insert(table).returning("*");
}

function seat(table_id, reservation_id) {
  console.log("seating knex");

  return knex("tables")
    .where({ table_id: table_id })
    .update({ reservation_id: reservation_id, status: "occupied" });
}

function updateReservation(reservation_id, status) {
  return knex("reservations")
    .where({ reservation_id: reservation_id })
    .update({ status: status });
}

module.exports = {
  list,
  create,
  seat,
  updateReservation,
};
