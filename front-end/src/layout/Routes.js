import React, { useEffect, useState } from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import { listReservations, listTables } from "../utils/api";
import Dashboard from "../dashboard/Dashboard";
import NewReservation from "../reservations/NewReservation";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import NewTable from "../tables/NewTable";
import ReserveSeat from "../reservations/ReserveSeat";
import Search from "../search/Search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  const date = query.get("date") ? query.get("date") : today();
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null); 

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables(abortController.signal)
      .then((tables) =>
        tables.sort((a, b) => a.table_name - b.table_name)
      )
      .then(setTables)
      .catch(setTablesError);
 
    return () => abortController.abort();
  }

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route exact={true} path="/reservations/new">
        <NewReservation />
      </Route>

      <Route path="/reservations/:reservation_id/edit">
        <NewReservation edit={true} reservations={reservations} loadDashboard={loadDashboard}/>
      </Route>

      <Route path="/reservations/:reservation_id/seat">
        <ReserveSeat loadDashboard ={loadDashboard } tables={tables} />
      </Route>

      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route exact={true} path="/tables/new">
        <NewTable loadDashboard={loadDashboard} />
      </Route>

      <Route path="/search">
        <Search />
      </Route>

      <Route path="/dashboard">
        <Dashboard
          date={date}
          reservations={reservations}
          reservationsError={reservationsError}
          tables={tables}
          tablesError={tablesError}
        />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
