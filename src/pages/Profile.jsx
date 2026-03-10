import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Profile({ isSidebarOpen, toggleSidebar }) {

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

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

  const handleSave = async () => {

    try {

      const res = await API.put("/user/me", form);

      setUser(res.data);
      setEditing(false);

    } catch (err) {

      alert("Update failed");

    }

  };

  if (!user) return <div>Loading...</div>;

  return (

    <div className="layout">

      {/* Sidebar */}

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
      />

      <main className="main">

        <div className="card">

          <h2>Profile</h2>

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

              {/* STUDENT EDIT FIELDS */}

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

              {/* TEACHER EDIT FIELDS */}

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