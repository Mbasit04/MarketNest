import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { adminApi.customers().then(setCustomers); }, []);
  return (
    <div className="mn-page-pad">
      <h2>Customers</h2>
      <table className="mn-table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.Id}>
              <td>{c.Id}</td>
              <td>{c.FullName}</td>
              <td>{c.Email}</td>
              <td>{c.Phone}</td>
              <td>{new Date(c.CreatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}