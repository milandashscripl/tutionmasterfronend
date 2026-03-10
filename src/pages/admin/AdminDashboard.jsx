import { useState } from "react";

import StudentsTable from "./StudentsTable";
import TeachersTable from "./TeachersTable";
import AdminAnalyticsChart from "../../components/AdminAnalyticsChart";

export default function AdminDashboard() {

  const [activeTab,setActiveTab] = useState("students");

  return (

    <div className="admin-dashboard">

      <h2>Dashboard</h2>

      <AdminAnalyticsChart/>

      {/* TABS */}

      <div className="admin-tabs">

        <button
          className={activeTab==="students"?"active":""}
          onClick={()=>setActiveTab("students")}
        >
          Students
        </button>

        <button
          className={activeTab==="teachers"?"active":""}
          onClick={()=>setActiveTab("teachers")}
        >
          Teachers
        </button>

      </div>

      {/* ANIMATED TAB CONTENT */}

      <div className="admin-tab-wrapper">

        <div className={`tab-panel ${activeTab==="students"?"show":"hide"}`}>
          <StudentsTable/>
        </div>

        <div className={`tab-panel ${activeTab==="teachers"?"show":"hide"}`}>
          <TeachersTable/>
        </div>

      </div>

    </div>

  );

}