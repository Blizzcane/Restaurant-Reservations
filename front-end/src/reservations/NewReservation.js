import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  createReservation,
  editReservation,
  listReservations,
} from "../utils/api";

//this component is reused for editing reservations.

function NewReservation({ edit, reservations, loadDashboard }) {
  const history = useHistory();
  const { reservation_id } = useParams();
  const [errors, setErrors] = useState([]);
  const [reservationsError, setReservationsError] = useState([]);
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  });

  useEffect(() => {
    if (edit) {
      if (!reservation_id) return null;

      loadReservations()
        .then((response) =>
          response.find(
            (reservation) =>
              reservation.reservation_id === Number(reservation_id)
          )
        )
        .then(fillFields);
    }

    function fillFields(foundReservation) {
      if (!foundReservation || foundReservation.status !== "booked") {
        return <p>Only booked reservations can be edited.</p>;
      }

      const date = new Date(foundReservation.reservation_date);
      const dateString = `${date.getFullYear()}-${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;

      setFormData({
        first_name: foundReservation.first_name,
        last_name: foundReservation.last_name,
        mobile_number: foundReservation.mobile_number,
        reservation_date: dateString,
        reservation_time: foundReservation.reservation_time,
        people: foundReservation.people,
      });
    }

    async function loadReservations() {
      const abortController = new AbortController();
      return await listReservations(null, abortController.signal).catch(
        setReservationsError
      );
    }
  }, [edit, reservation_id]);

  function handleChange({ target }) { 
    setFormData({ ...formData, [target.name]: target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();


    formData.mobile_number = formatPhoneNumber(formData.mobile_number);

    const errorList = [];
    console.log(edit);
    if (validateFields(errorList) && validateDate(errorList)) {
      if (edit) {
        editReservation(reservation_id, formData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      } else {
        createReservation(formData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      }
    }

    setErrors(errorList);

    return () => abortController.abort();
  }

  const formatPhoneNumber = (number) => {
    let phoneNumber = number.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;

  // we need to return the value with no formatting if its less then four digits
  // this is to avoid weird behavior that occurs if you  format the area code to early
  if (phoneNumberLength < 4) return phoneNumber;

  // if phoneNumberLength is greater than 4 and less the 7 we start to return
  // the formatted number
  if (phoneNumberLength < 7) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }

  // finally, if the phoneNumberLength is greater then seven, we add the last
  // bit of formatting and return it.
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
  };

  //makes sure fields are not empty before submitting reservation
  function validateFields(errorList) {
    for (let field in formData) {
      if (formData[field] === "") {
        const fieldName =
          field.charAt(0).toUpperCase() + field.slice(1).split("_").join(" ");
        errorList.push({ message: `${fieldName} cannot be left blank.` });
      }
    }

    let phoneNumber = formData.mobile_number.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;

    if(phoneNumberLength < 10){
      errorList.push({ message: "Phone Number must be 10 digits" });
    }

    if (formData.people <= 0) {
      errorList.push({ message: "Party size must be at least 1 person." });
    }

    if (errorList.length > 0) {
      return false;
    }
    return true;
  }

  function validateDate(errorList) {
    const reservationDate = new Date(
      `${formData.reservation_date}T${formData.reservation_time}:00.000`
    );
    const todaysDate = new Date();

    //checks if it's Tuesday
    if (reservationDate.getDay() === 2) {
      errorList.push({ message: "The restaurant is closed on Tuesday!" });
    }
    //checks if date is in the past
    if (reservationDate < todaysDate) {
      errorList.push({ message: "Reservations cannot be made in the past." });
    }

    //checks if the time is before 10:30am opening
    if (
      reservationDate.getHours() < 10 ||
      (reservationDate.getHours() === 10 && reservationDate.getMinutes() < 30)
    ) {
      errorList.push({ message: "Restaurant is not open until 10:30AM." });
    } else if (
      reservationDate.getHours() > 22 ||
      (reservationDate.getHours() === 22 && reservationDate.getMinutes() >= 30)
    ) {
      errorList.push({ message: "Restaurant is closed after 10:30PM." });
    } else if (
      reservationDate.getHours() > 21 ||
      (reservationDate.getHours() === 21 && reservationDate.getMinutes() > 30)
    ) {
      errorList.push({
        message:
          "Reservation must be made at least an hour before closing (10:30PM).",
      });
    }

    if (errorList.length > 0) {
      return false;
    }
    // if we get here, our reservation date is valid!
    return true;
  }

  //maps the list of errors from validate
  const displayErrors = () => {
    return errors.map((err, idx) => <ErrorAlert key={idx} error={err} />);
  };
  const displayApiErrors = () => {
    if (apiError === null) return null;
    return apiError.map((err, idx) => <ErrorAlert key={idx} error={err} />);
  };

  return (
    <form className="m-2">
      {displayErrors()}
      {displayApiErrors()}
      <ErrorAlert
        error={reservationsError.length > 0 ? reservationsError : null}
      />

      <div class="form-group row">
        <label htmlFor="first_name" className="col-sm-2 col-form-label">
          First Name
        </label>
        <div className="col-sm-10">
          <input
            name="first_name"
            id="first_name"
            type="text"
            className="form-control"
            onChange={handleChange}  
            value={formData.first_name}  
            required  
          />
        </div>
      </div>

      <div class="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor="last_name">
          Last Name
        </label>
        <div className="col-sm-10">
          <input
            name="last_name"
            id="last_name"
            type="text"
            className="form-control"
            onChange={handleChange} // will add this in soon!
            value={formData.last_name} // this as well!
            required // this will make the field non-nullable
          />
        </div>
      </div>

      <div class="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor="mobile_number">
          Mobile Number
        </label>
        <div className="col-sm-10">
          <input
            name="mobile_number"
            id="mobile_number"
            type="text"
            className="form-control"
            onChange={handleChange} // will add this in soon!
            value={formData.mobile_number} // this as well!
            required // this will make the field non-nullable
          />
        </div>
      </div>

      <div class="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor="reservation_date">
          Reservation Date
        </label>
        <div className="col-sm-10">
          <input
            name="reservation_date"
            id="reservation_date"
            type="date"
            className="form-control"
            onChange={handleChange} // will add this in soon!
            value={formData.reservation_date} // this as well!
            required // this will make the field non-nullable
          />{" "}
        </div>
      </div>
      <div class="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor="reservation_time">
          Reservation Time
        </label>
        <div className="col-sm-10">
          <input
            name="reservation_time"
            id="reservation_time"
            type="time"
            className="form-control"
            onChange={handleChange} // will add this in soon!
            value={formData.reservation_time} // this as well!
            required // this will make the field non-nullable
          />
        </div>
      </div>
      <div class="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor="people">
          Party Size
        </label>
        <div className="col-sm-10">
          <input
            name="people"
            id="people"
            type="text"
            className="form-control"
            onChange={handleChange} // will add this in soon!
            value={formData.people} // this as well!
            required // this will make the field non-nullable
          />
        </div>
      </div>

      <button
        className="btn btn-primary m-1"
        type="submit"
        onClick={handleSubmit}
      >
        Submit
      </button>
      <button
        className="btn btn-danger m-1"
        type="button"
        onClick={history.goBack}
      >
        Cancel
      </button>
    </form>
  );
}

export default NewReservation;
