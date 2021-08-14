import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function NewReservation() {
  const history = useHistory();
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  });

  function handleChange({ target }) {
    setFormData({ ...formData, [target.name]: target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (validateDate()) {
      history.push(`/dashboard?date=${formData.reservation_date}`);
    }
  }

  function validateDate() {
    const reservationDate = new Date(formData.reservation_date);
    const todaysDate = new Date();

    const errorList = [];

    //checks if it's Tuesday
    if (reservationDate.getDay() === 1) {
      errorList.push({ message: "The restaurant is closed on Tuesday!" });
    }
    //checks if date is in the past
    if (reservationDate < todaysDate) {
      errorList.push({ message: "Reservations cannot be made in the past." });
    }
    console.log(errorList);
    setErrors(errorList);

    if (errorList.length > 0) {
      return false;
    }
    // if we get here, our reservation date is valid!
    return true;
  }

  const displayErrors = () => {
    return errors.map((err, idx) => <ErrorAlert key={idx} error={err} />);
  };

  return (
    <form>
      {displayErrors()}

      <label htmlFor="first_name">First Name:&nbsp;</label>

      <input
        name="first_name"
        id="first_name"
        type="text"
        onChange={handleChange} // will add this in soon!
        value={formData.first_name} // this as well!
        required // this will make the field non-nullable
      />
      <label htmlFor="last_name">Last Name:&nbsp;</label>

      <input
        name="last_name"
        id="last_name"
        type="text"
        onChange={handleChange} // will add this in soon!
        value={formData.last_name} // this as well!
        required // this will make the field non-nullable
      />
      <label htmlFor="mobile_number">Mobile Number:&nbsp;</label>

      <input
        name="mobile_number"
        id="mobile_number"
        type="text"
        onChange={handleChange} // will add this in soon!
        value={formData.mobile_number} // this as well!
        required // this will make the field non-nullable
      />
      <label htmlFor="reservation_date">Reservation Date:&nbsp;</label>
      <input
        name="reservation_date"
        id="reservation_date"
        type="date"
        onChange={handleChange} // will add this in soon!
        value={formData.reservation_date} // this as well!
        required // this will make the field non-nullable
      />
      <label htmlFor="reservation_time">Reservation Time:&nbsp;</label>

      <input
        name="reservation_time"
        id="reservation_time"
        type="time"
        onChange={handleChange} // will add this in soon!
        value={formData.reservation_time} // this as well!
        required // this will make the field non-nullable
      />
      <label htmlFor="people">Party Size:&nbsp;</label>

      <input
        name="people"
        id="people"
        type="text"
        onChange={handleChange} // will add this in soon!
        value={formData.people} // this as well!
        required // this will make the field non-nullable
      />
      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
      <button type="button" onClick={history.goBack}>
        Cancel
      </button>
    </form>
  );
}

export default NewReservation;
