import React from "react";
import { updateReservationStatus } from "../utils/api";

function ReservationRow({ reservation, loadDashboard  }) {
  if (!reservation || reservation.status === "finished") return null;

  function handleCancel() {
		if(window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
			const abortController = new AbortController();

			updateReservationStatus(reservation.reservation_id, "cancelled", abortController.status)
				.then(loadDashboard);

			return () => abortController.abort();
		}
	}

  const timeFormatter = (time) => {
    time = time.split(':');
    if( Number(time[0]) === 12 ) return `12:00 p.m.`;
    return (Number(time[0]) > 12 ? `${time[0]-12}:${time[1]} p.m.` : `${time[0]}:${time[1]} a.m.` );
  } 

  return (
    <tr>
      <th scope="row">{reservation.reservation_id}</th>
      <td>{reservation.first_name}</td>
      <td>{reservation.last_name}</td>
      <td>{reservation.mobile_number}</td>
      <td>{timeFormatter(reservation.reservation_time)}</td>
      <td>{reservation.people}</td>
      <td data-reservation-id-status={reservation.reservation_id}>
        {reservation.status}
      </td>

      <td>
        <a href={`/reservations/${reservation.reservation_id}/edit`}>
          <button className="btn btn-outline-primary btn-sm" type="button">Edit</button>
        </a>
      </td>

      <td>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={handleCancel}
          data-reservation-id-cancel={reservation.reservation_id}
        >
          Cancel
        </button>
      </td>

      {reservation.status === "booked" && (
        <td>
          <a href={`/reservations/${reservation.reservation_id}/seat`}>
            <button type="button" className="btn btn-outline-success btn-sm">Seat</button>
          </a>
        </td>
      )}
    </tr>
  );
}

export default ReservationRow;
