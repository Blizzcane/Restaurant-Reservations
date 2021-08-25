import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations, seatTable } from "../utils/api";

function ReserveSeat({ loadDashboard, tables }) {
  const history = useHistory();
  const [table_id, setTableId] = useState(1);
  const [errors, setErrors] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [reservationsError, setReservationsError] = useState(null);

  const { reservation_id } = useParams();

  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();

    setReservationsError(null);

    listReservations(null, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    return () => abortController.abort();
  }, []);

  if (!tables || !reservations) return null;

  function handleChange({ target }) {
    setTableId(target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    if (validateSeat()) {
      seatTable(reservation_id, table_id, abortController.signal)
        .then(loadDashboard)
        .then(() => history.push(`/dashboard`))
        .catch(setApiError);
    }

    return () => abortController.abort();
  }

  const tableOptionsJSX = () => {
    return tables.map((table, idx) => (
      <option value={table.table_id} key={idx}>
        {table.table_name} - {table.capacity}{" "}
        {table.capacity > 1 ? "people" : "person"}
      </option>
    ));
  };
  function validateSeat() {
    const foundErrors = [];
    const foundTable = tables.find(
      (table) => table.table_id === Number(table_id)
    );
    const foundReservation = reservations.find(
      (reservation) => reservation.reservation_id === Number(reservation_id)
    );

    // console.log("foundTable:",foundTable);
    // console.log("foundReservation:",foundReservation);

    if (!foundTable) {
      foundErrors.push("The table does not exist.");
    } else if (!foundReservation) {
      foundErrors.push("The reservation does not exist.");
    } else {
      if (foundTable.status === "occupied") {
        foundErrors.push("The table selected is full.");
      }

      if (foundTable.capacity < foundReservation.people) {
        foundErrors.push(
          `This table cannot seat ${foundReservation.people} people.`
        );
      }
    }
    setErrors(foundErrors);
    
    return foundErrors.length === 0;
  }

  const errorsJSX = () => {
    return errors.map((error, idx) => <ErrorAlert key={idx} error={error} />);
  };

  return (
    <form>
      {errorsJSX()} 
      
      <label htmlFor="table_id">Choose table:</label>
      <select
        name="table_id"
        id="table_id"
        value={table_id}
        onChange={handleChange}
      >
        {tableOptionsJSX()}
      </select>
      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
      <button type="button" onClick={history.goBack}>
        Cancel
      </button>
    </form>
  );
}

export default ReserveSeat;
