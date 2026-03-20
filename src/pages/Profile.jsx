import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Profile({ isSidebarOpen, toggleSidebar }) {

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const fileRef = useRef();

  useEffect(() => {

    API.get("/user/me")
      .then(res => setUser(res.data))
      .catch(() => window.location = "/");

  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({
      ...form,
      profilePic: file
    });
  };

  const handleSave = async () => {

    try {

      const data = new FormData();

      Object.keys(form).forEach(key => {

        data.append(key, form[key]);

      });

      const res = await API.put("/user/me", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setUser(res.data);
      setEditing(false);

    } catch (err) {

      alert("Update failed");

    }

  };

  if (!user) return <div>Loading...</div>;

  return (

    <div className="layout">

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
      />

      <main className="main">

        <div className="card">

          <h2>Profile</h2>

          {/* PROFILE IMAGE */}

          <div style={{ marginBottom: 20, textAlign: "center" }}>

            {user.profilePic?.url ? (

              <img
                src={user.profilePic.url}
                alt="profile"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #6366f1"
                }}
              />

            ) : (

              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "#6366f1",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  margin: "auto"
                }}
              >
                {user.fullName?.[0]?.toUpperCase()}
              </div>

            )}

            {editing && (

              <div style={{ marginTop: 10 }}>

                <button onClick={() => fileRef.current.click()}>
                  Change Photo
                </button>

                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

              </div>

            )}

          </div>

          {!editing ? (

            <>

              <p>Name : {user.fullName}</p>
              <p>Email : {user.email}</p>
              <p>Phone : {user.phone}</p>
              <p>Gender : {user.gender}</p>
              <p>Age : {user.age}</p>

              {/* STUDENT DETAILS */}

              {user.registrationType === "student" && user.studentDetails && (

                <>
                  <p>Class : {user.studentDetails.standard}</p>
                  <p>Board : {user.studentDetails.board}</p>
                  <p>
                    Subjects : {user.studentDetails.subjects?.join(", ")}
                  </p>
                </>

              )}

              {/* TEACHER DETAILS */}

              {user.registrationType === "teacher" && user.teacherDetails && (

                <>
                  <p>Teaching upto : {user.teacherDetails.teachingUpto}</p>
                  <p>
                    Subjects : {user.teacherDetails.subjectsExpert?.join(", ")}
                  </p>
                  <p>Distance : {user.teacherDetails.distance} km</p>
                </>

              )}

              <button onClick={() => setEditing(true)}>
                Edit
              </button>

            </>

          ) : (

            <>

              <input
                name="fullName"
                placeholder="Full Name"
                defaultValue={user.fullName}
                onChange={handleChange}
              />

              <input
                name="phone"
                placeholder="Phone"
                defaultValue={user.phone}
                onChange={handleChange}
              />

              <input
                name="age"
                placeholder="Age"
                defaultValue={user.age}
                onChange={handleChange}
              />

              {/* STUDENT EDIT */}

              {user.registrationType === "student" && (

                <>
                  <input
                    name="standard"
                    placeholder="Class"
                    defaultValue={user.studentDetails?.standard}
                    onChange={handleChange}
                  />

                  <input
                    name="board"
                    placeholder="Board"
                    defaultValue={user.studentDetails?.board}
                    onChange={handleChange}
                  />

                  <input
                    name="subjects"
                    placeholder="Subjects (comma separated)"
                    defaultValue={user.studentDetails?.subjects?.join(", ")}
                    onChange={handleChange}
                  />
                </>

              )}

              {/* TEACHER EDIT */}

              {user.registrationType === "teacher" && (

                <>
                  <input
                    name="teachingUpto"
                    placeholder="Teaching upto"
                    defaultValue={user.teacherDetails?.teachingUpto}
                    onChange={handleChange}
                  />

                  <input
                    name="subjectsExpert"
                    placeholder="Subjects (comma separated)"
                    defaultValue={user.teacherDetails?.subjectsExpert?.join(", ")}
                    onChange={handleChange}
                  />

                  <input
                    name="distance"
                    placeholder="Distance (km)"
                    defaultValue={user.teacherDetails?.distance}
                    onChange={handleChange}
                  />
                </>

              )}

              <button onClick={handleSave}>
                Save
              </button>

            </>

          )}

        </div>

      </main>

    </div>

  );

}