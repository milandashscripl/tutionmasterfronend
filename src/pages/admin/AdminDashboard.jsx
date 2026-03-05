import { useState } from "react";

import StudentsTable from "./StudentsTable";
import TeachersTable from "./TeachersTable";
import RegistrationChart from "../../components/RegistrationChart";

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("students");

  return (

    <div className="admin-dashboard">

      <h2>Dashboard</h2>

      <RegistrationChart />

      {/* TAB BUTTONS */}
      <div className="admin-tabs">

        <button
          className={activeTab === "students" ? "active" : ""}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>

        <button
          className={activeTab === "teachers" ? "active" : ""}
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </button>

      </div>

      {/* TAB CONTENT */}

      <div className="admin-tab-content">

        {activeTab === "students" && <StudentsTable />}

        {activeTab === "teachers" && <TeachersTable />}

      </div>

    </div>

  );
}