import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Courses({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/user/me").then((res) => setUser(res.data)).catch(() => { window.location.href = "/"; });
  }, []);

  useEffect(() => {
    // Load courses
    setLoading(true);
    API.get("/courses").then((res) => {
      setCourses(res.data || []);
    }).catch(() => {
      setCourses([]);
    }).finally(() => setLoading(false));
  }, []);

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      <div className={"overlay " + (isSidebarOpen ? "open" : "")} onClick={() => toggleSidebar && toggleSidebar(false)} />
      <div className={"sidebar " + (isSidebarOpen ? "open" : "closed")}>
        <Sidebar user={user} onNavigate={() => {}} />
      </div>

      <main className="main" style={{ width: "100%" }}>
        <div className="hero">
          <div className="lead">
            <h2>My Courses</h2>
            <p className="muted">Explore and manage your enrolled courses</p>
          </div>
        </div>

        {loading ? (
          <div className="card">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <h3 style={{ color: "var(--muted)" }}>No courses yet</h3>
              <p className="muted">You haven't enrolled in any courses yet. Browse available courses to get started!</p>
              <button style={{ marginTop: "20px", width: "auto", padding: "12px 24px" }}>Browse Courses</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {courses.map((course) => (
              <div key={course._id} className="card" style={{ maxWidth: "none" }}>
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.name} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} />
                )}
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>{course.name}</h3>
                <p className="muted" style={{ marginBottom: "12px" }}>{course.description}</p>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px", fontSize: "0.9rem", flexWrap: "wrap" }}>
                  <span style={{ backgroundColor: "rgba(201,163,94,0.1)", color: "var(--accent-1)", padding: "4px 8px", borderRadius: "6px" }}>
                    {course.instructor?.name || "Instructor"}
                  </span>
                  <span style={{ backgroundColor: "rgba(201,163,94,0.1)", color: "var(--accent-1)", padding: "4px 8px", borderRadius: "6px" }}>
                    {course.level || "Beginner"}
                  </span>
                  {course.hours && (
                    <span style={{ backgroundColor: "rgba(201,163,94,0.1)", color: "var(--accent-1)", padding: "4px 8px", borderRadius: "6px" }}>
                      {course.hours} hours
                    </span>
                  )}
                </div>
                <button style={{ width: "100%", marginBottom: "0" }}>View Course</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
