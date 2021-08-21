import React, { useState } from "react";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import { updateTable } from "../utils/api";

function ReserveSeat({ reservations, tables }) {
  const history = useHistory();
  const [tableId, setTableId] = useState(1);
  const [errors, setErrors] = useState([]);
  const { reservation_id } = useParams();
  const reservationId = parseInt(reservation_id);

  if (!tables || !reservations) return null;

  function handleChange({ target }) { 
    setTableId(parseInt(target.value));
  }

  function handleSubmit(event) {
    event.preventDefault(); 
    if (validateSeat()) {
      // console.log("validated"); 
      const foundTable = tables.find((table) => table.table_id === tableId);
      foundTable.reservation_id = reservation_id;
      updateTable(foundTable);
      history.push(`/dashboard`);
    }
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

    const foundTable = tables.find((table) => table.table_id === tableId);
    const foundReservation = reservations.find(
      (reservation) => reservation.reservation_id === reservationId
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
    console.log(foundErrors);
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
