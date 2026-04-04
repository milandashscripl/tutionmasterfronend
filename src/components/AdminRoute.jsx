import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/api";
import Loader from "./Loader";

export default function AdminRoute({ children }) {

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const checkAdmin = async () => {

      try {

        const res = await API.get("/user/me");

        const user = res.data;

        if (
          user.registrationType === "admin" &&
          user.isApproved === true
        ) {
          setIsAdmin(true);
        }

      } catch (err) {
        console.log("Admin check failed", err);
      }

      setLoading(false);
    };

    checkAdmin();

  }, []);

  if (loading) {
    return <Loader message="Checking admin access..." className="mx-auto" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}