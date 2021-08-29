const knex = require("../db/connection");

function list(date, mobileNumber) {
  if (date) {
    return knex("reservations").select("*").where({ reservation_date: date });
  }

  if (mobileNumber) {
    console.log(mobileNumber);
    return knex("reservations")
      .select("*")
			.where('mobile_number', 'like', `${mobileNumber}%`);
  } 

  return knex("reservations").select("*");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdReservations) => createdReservations[0]);
}

function read(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation_id })
    .first();
}

function update(reservation_id, status) {
  return knex("reservations")
    .where({ reservation_id: reservation_id })
    .update({ status: status });
}

function edit(reservation_id, reservation) {
  return knex("reservations")
    .where({ reservation_id: reservation_id })
    .update({ ...reservation })
    .returning("*");
}

module.exports = {
  list,
  create,
  read,
  update,
  edit,
};
