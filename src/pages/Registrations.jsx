import { useEffect, useState } from "react";
import axios from "../services/api";
import RegistrationsTable from "../components/RegistrationsTable";

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    axios.get("/admin/registrations/")
      .then(res => setRegistrations(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>All Registrations</h2>
      <RegistrationsTable registrations={registrations} />
    </div>
  );
};

export default Registrations;
