import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Welcome {user?.name}</h1>
      <p>You are logged in 🎉</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
