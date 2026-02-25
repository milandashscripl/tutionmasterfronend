import Home from "./Home";

export default function Dashboard({ isSidebarOpen, toggleSidebar }) {
  return <Home isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />;
}