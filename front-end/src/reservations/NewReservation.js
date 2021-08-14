import React, { useState } from "react";
import { useHistory } from "react-router-dom";

function NewReservation() {
  const history = useHistory();

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
    history.push(`/dashboard?date=${formData.reservation_date}`);
  }

  return (
    <form>
      <label htmlFor="first_name">First Name:&nbsp;</label>

      <input
        name="first_name"
        id="first_name"
        type="text"
        onChange={handleChange} // will add this in soon!
        value={formData.first_name} // this as well!
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
