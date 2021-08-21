const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const response = await service.list();

  res.json({ data: response });
}

function validateBody(req, res, next) {
  if (!req.body.data.table_name || req.body.data.table_name === "") {
    return next({ status: 400, message: "'table_name' field cannot be empty" });
  }

  if (req.body.data.table_name.length < 2) {
    return next({
      status: 400,
      message: "'table_name' field must be at least 2 characters",
    });
  }

  if (!req.body.data.capacity || req.body.data.capacity === "") {
    return next({ status: 400, message: "'capacity' field cannot be empty" });
  }

  if (parseInt(req.body.data.capacity) < 1) {
    return next({
      status: 400,
      message: "'capacity' field must be at least 1",
    });
  }

  next();
}

async function create(req, res) {
  req.body.data.status = "free";

  const response = await service.create(req.body.data);

  res.status(201).json({ data: response[0] });
}

async function validateTableId(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);

  if (!table) {
    return next({
      status: 404,
      message: `table id ${table_id} does not exist`,
    });
  }

  res.locals.table = table;

  next();
}

async function validateReservationId(req, res, next) {
  const { reservation_id } = req.body.data;

  if (!reservation_id) {
    return next({
      status: 400,
      message: `reservation_id field is missing from the body`,
    });
  }

  const reservation = await service.readReservation(Number(reservation_id));

  if (!reservation) {
    return next({
      status: 404,
      message: `reservation_id ${reservation_id} does not exist`,
    });
  }

  res.locals.reservation = reservation;

  next();
}

async function validateSeat(req, res, next) {
  if (res.locals.table.status === "occupied") {
    return next({
      status: 400,
      message: "the table you selected is currently occupied",
    });
  }

  if (res.locals.reservation.status === "seated") {
    return next({
      status: 400,
      message: "the reservation you selected is already seated",
    });
  }

  if (res.locals.table.capacity < res.locals.reservation.people) {
    return next({
      status: 400,
      message: `the table you selected does not have enough capacity to seat ${res.locals.reservation.people} people`,
    });
  }

  next();
}

async function update(req, res) {
  req.body.data;
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [validateBody, asyncErrorBoundary(create)],
  update: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(validateSeat),
    asyncErrorBoundary(update),
  ],
};
