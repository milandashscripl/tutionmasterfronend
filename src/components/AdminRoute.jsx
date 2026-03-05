import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/api";

export default function AdminRoute({ children }) {

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const checkAdmin = async () => {
      try {

        const res = await API.get("/user/me");

        if (res.data.registrationType === "admin") {
          setIsAdmin(true);
        }

      } catch (err) {
        console.log("Admin check failed");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

  }, []);

  if (loading) {
    return <div style={{padding:"40px"}}>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}