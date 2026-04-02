import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";

import StudentsTable from "./StudentsTable";
import TeachersTable from "./TeachersTable";
import AdminAnalyticsChart from "../../components/AdminAnalyticsChart";

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("students");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    pendingApprovals: 0,
    activeTeachers: 0,
    totalCourses: 0,
    defaulters: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersRes = await API.get("/admin/users");
      const users = usersRes.data;

      const studentsCount = users.filter(u => u.registrationType === "student").length;
      const teachersCount = users.filter(u => u.registrationType === "teacher").length;
      const activeTeachersCount = users.filter(u => u.registrationType === "teacher" && u.teacherDetails?.isActive).length;
      const approvedTeachers = users.filter(u => u.registrationType === "teacher" && u.isApproved).length;

      const pendingRes = await API.get("/admin/pending");
      const pendingCount = pendingRes.data.length;

      // Calculate defaulters
      let defaultersCount = 0;
      users.forEach(user => {
        if (user.studentDetails?.hiredTeachers) {
          user.studentDetails.hiredTeachers.forEach(ht => {
            const nextDue = new Date(ht.nextDueAt);
            if (nextDue < new Date()) {
              defaultersCount++;
            }
          });
        }
      });

      setStats({
        totalUsers: users.length,
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        pendingApprovals: pendingCount,
        activeTeachers: activeTeachersCount,
        approvedTeachers,
        defaulters: defaultersCount
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setLoading(false);
    }
  };

  return (

    <div className="admin-dashboard">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <button 
          onClick={fetchStats}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      {!loading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <StatCard label="Total Users" value={stats.totalUsers} color="#3B82F6" />
          <StatCard label="Students" value={stats.totalStudents} color="#10B981" />
          <StatCard label="Teachers" value={stats.totalTeachers} color="#F59E0B" />
          <StatCard label="Pending Approval" value={stats.pendingApprovals} color="#EF4444" />
          <StatCard label="Active Teachers" value={stats.activeTeachers} color="#8B5CF6" />
          <StatCard label="Defaulters" value={stats.defaulters} color="#DC2626" />
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link 
            to="/admin/user-requests"
            style={{
              background: '#EC4899',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            👥 Review User Requests
          </Link>
          <Link 
            to="/admin/landing-page"
            style={{
              background: '#3B82F6',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🎨 Manage Landing Page
          </Link>
          <Link 
            to="/admin/app-settings"
            style={{
              background: '#6366F1',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ⚙️ App Settings
          </Link>
        </div>
      </div>

      <AdminAnalyticsChart/>

      {/* TABS */}

      <div className="admin-tabs" style={{ marginTop: '30px' }}>

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

// StatCard Component
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff',
      border: `3px solid ${color}`,
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color, marginBottom: '8px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
        {label}
      </div>
    </div>
  );
}