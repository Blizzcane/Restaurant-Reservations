import React, { useState } from "react";
import ReservationList from "../dashboard/ReservationRow";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";

function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  // const formatPhoneNumber = (number) => {
  //   let phoneNumber = number.replace(/[^\d]/g, "");
  //   return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
  //     3,
  //     6
  //   )}-${phoneNumber.slice(6, 10)}`;
  // };

  function handleChange({ target }) {
    setMobileNumber(target.value);
  }

  // const validateNumber = (number) => {
  //   var re = /^\d{3}-\d{3}-\d{4}/g; 

  //   return re.test(number);
  // };

  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();
    setError(null); 
    if (mobileNumber){ 
      listReservations({ mobile_number: mobileNumber }, abortController.signal)
        .then(setReservations)
        .catch(setError);
    }

    return () => abortController.abort();
  }

  const searchResultsJSX = () => {
    return reservations.length > 0 ? (
      reservations.map((reservation) => (
        <ReservationList
          key={reservation.reservation_id}
          reservation={reservation}
        />
      ))
    ) : (
      <p>No reservations found</p>
    );
  };

  return (
    <div>
      <form className="m-1 form-inline">
        <ErrorAlert error={error} />

        <label htmlFor="mobile_number">
          Enter customer's phone number:&nbsp;
        </label>
        <input
          name="mobile_number"
          id="mobile_number"
          type="tel"
          onChange={handleChange}
          value={mobileNumber}
          placeholder="(000)-000-0000"
          className="form-control mr-sm-2 "
          required
        />

        <button className="btn btn-outline-primary my-2 my-sm-0" type="submit" onClick={handleSubmit}>
          Find
        </button>
      </form>
      

      <table className="table">
        <thead className="shadow-sm">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Time</th>
            <th scope="col">People</th>
            <th scope="col">Status</th>
            <th scope="col">Edit</th>
            <th scope="col">Cancel</th>
            <th scope="col">Seat</th>
          </tr>
        </thead>

        <tbody>{searchResultsJSX()}</tbody>
      </table>
    </div>
  );
}

export default Search;
