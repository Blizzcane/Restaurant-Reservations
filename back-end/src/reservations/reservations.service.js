const knex = require("../db/connection");

function list(date) {
  if (date) {
    return knex("reservations").select("*").where({ reservation_date: date });
  }

  return knex("reservations").select("*");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
	.returning("*")
    .then((createdReservations) => createdReservations[0]);
}

module.exports = {
  list,
  create,
};
