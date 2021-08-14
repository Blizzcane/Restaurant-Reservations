import React from "react";
import { useHistory } from "react-router-dom";

function TableList({ table }) {
  const history = useHistory();

  if (!table) return null;

  function handleFinish() {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      // delete request here, will add this later
      history.push("/dashboard");
    }
  }

  return (
    <tr>
      <th scope="row">{table.table_id}</th>
      <td>{table.table_name}</td>
      <td>{table.capacity}</td>

      <td data-table-id-status={table.table_id}>{table.status}</td>
      {table.status === "occupied" && (
        <td data-table-id-finish={table.table_id}>
          <button onClick={handleFinish} type="button">
            Finish
          </button>
        </td>
      )}
    </tr>
  );
}

export default TableList;
