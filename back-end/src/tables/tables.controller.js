const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const response = await service.list();

  res.json({ data: response });
}

function validateBody(req, res, next) {
  // console.log("checking body");

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
  // console.log("checking Table ID validity");

  const { table_id } = req.params;
  const table = await service.readTable(table_id);
  // console.log("table", table);

  if (!table) {
    return next({
      status: 404,
      message: `table id ${table_id} does not exist`,
    });
  }

  res.locals.table = table;
  res.locals.table_id = table_id;

  next();
}

async function validateReservationId(req, res, next) {
  // console.log("checking reservation ID validity");

  const { reservation_id } = req.body.data;
  console.log("res Id", reservation_id);
  const reservation = await service.read(Number(reservation_id));
  console.log("reservation", reservation);

  if (!reservation_id) {
    return next({
      status: 400,
      message: `reservation_id field is missing from the body`,
    });
  }

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
  // console.log("checking seat validity");
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
  // console.log("updating tables");
  // console.log("table_id", res.locals.table_id);
  await service.seat(
    res.locals.table_id,
    res.locals.reservation.reservation_id
  );
  await service.updateReservation(
    res.locals.reservation.reservation_id,
    "seated"
  );

  res.status(200).json({ data: { status: "seated" } });
}

async function validateData(req, res, next) {
  if (!req.body.data) {
    return next({ status: 400, message: "Body must include a data object" });
  }

  next();
}

async function validateSeatedTable(req, res, next) {
  console.log("table status:",res.locals.table);
  if (res.locals.table.status !== "occupied") {
    return next({ status: 400, message: "this table is not occupied" });
  }

  next();
}

async function destroy(req, res) {
  await service.updateReservation(res.locals.table.reservation_id, "finished");
  await service.cleanTable(res.locals.table.table_id);

  res.status(200).json({ data: { status: "finished" } });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [asyncErrorBoundary(validateData), asyncErrorBoundary(validateBody), asyncErrorBoundary(create)],
  update: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(validateSeat),
    asyncErrorBoundary(update),
  ],
  destroy: [
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateSeatedTable),
    asyncErrorBoundary(destroy),
  ],
};
