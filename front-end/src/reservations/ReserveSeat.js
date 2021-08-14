import React, { useState } from "react";
import { useHistory } from "react-router";

function ReserveSeat({ reservations, tables }) {
  const history = useHistory();
  const [tableId, setTableId] = useState(0);
  const [errors, setErrors] = useState([]);

  if (!tables || !reservations) return null;

  function handleChange({ target }) {
    setTableId(target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (validateSeat()) {
      history.push(`/dashboard`);
    }
  }

  const tableOptionsJSX = () => {
    return tables.map((table) => (
      <option value={table.table_id}>
        {table.table_name} - {table.capacity}
      </option>
    ));
  };
  function validateSeat() {
    const foundErrors = [];

    const foundTable = tables.find((table) => table.table_id === tableId);
    const foundReservation = reservations.find(
      (reservation) => reservation.reservation_id === reservation_id
    );

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

  return (
    <form>
      <label htmlFor="table_id">Choose table:</label>
      <select
        name="table_id"
        id="table_id"
        value={tableId}
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
