import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://tutionmasterbacknend.onrender.com";

export default function Chats({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const getInitial = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const getProfileUrl = (u) => {
    return u?.profilePic?.url || u?.profilePic || null;
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === "all") return true;
    return u.registrationType?.toLowerCase() === activeTab;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    API.get("/user/me")
      .then((res) => setUser(res.data))
      .catch(() => (window.location.href = "/"));
  }, []);

  useEffect(() => {
    if (!user) return;
    API.get("/user")
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    API.get("/chats")
      .then((res) => setChats(res.data || []))
      .catch(() => setChats([]));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("user:register", user._id);
    });

    socket.on("chat:message:new", (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    return () => socket.disconnect();
  }, [user]);

  const handleStartChat = async (otherUserId) => {
    try {
      const res = await API.post(`/chats/user/${otherUserId}`);
      const chat = res.data;

      setSelectedChat(chat._id);

      setChats((prev) => {
        if (prev.some((c) => c._id === chat._id)) return prev;
        return [chat, ...prev];
      });

      await loadMessages(chat._id);
    } catch {
      alert("Failed to start chat");
    }
  };

  const loadMessages = async (chatId) => {
    try {
      setLoadingMessages(true);
      const res = await API.get(`/chats/${chatId}/messages`);
      setMessages(res.data || []);
      socketRef.current?.emit("chat:join", chatId);
      await API.put(`/chats/${chatId}/mark-read`);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);

      const res = await API.post(`/chats/${selectedChat}/messages`, {
        content: newMessage,
      });

      setMessages((prev) => [...prev, res.data]);

      socketRef.current?.emit("chat:message", {
        chatId: selectedChat,
        message: res.data,
      });

      setNewMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const selectedChatData = chats.find((c) => c._id === selectedChat);
  const selectedUser =
    selectedChatData?.participants?.find(
      (p) => p._id !== user?._id
    );

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      <div
        className={"overlay " + (isSidebarOpen ? "open" : "")}
        onClick={() => toggleSidebar && toggleSidebar(false)}
      />

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar && toggleSidebar(false)}
      />

      <main className="main" style={{ padding: "20px", width: "100%" }}>
        <div className="card" style={{ width: "100%", height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
          
          {!selectedChat ? (
            <>
              <div style={{ padding: "16px", fontWeight: "bold", borderBottom: "1px solid #eee" }}>
                Choose a user to start chatting
              </div>

              {/* TABS */}
              <div style={{ display: "flex", borderBottom: "1px solid #eee", background: "#fff" }}>
                {["all", "teacher", "student", "admin"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "none",
                      cursor: "pointer",
                      background: activeTab === tab ? "var(--accent-1)" : "transparent",
                      color: activeTab === tab ? "#fff" : "#333",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* USER LIST */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {filteredUsers.length === 0 && (
                  <div style={{ padding: "16px", color: "#777" }}>
                    No users found.
                  </div>
                )}

                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleStartChat(u._id)}
                    style={{
                      padding: "14px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f1f1",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {getProfileUrl(u) ? (
                      <img
                        src={getProfileUrl(u)}
                        alt="profile"
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "var(--accent-1)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                        }}
                      >
                        {getInitial(u.fullName || u.email)}
                      </div>
                    )}

                    <span>{u.fullName || u.email}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #eee", fontWeight: "bold", display: "flex", alignItems: "center", gap: "12px", background: "#fff" }}>
                <button
                  onClick={() => {
                    setSelectedChat(null);
                    setMessages([]);
                  }}
                  style={{ border: "none", background: "none", cursor: "pointer", fontSize: "20px" }}
                >
                  ←
                </button>

                {getProfileUrl(selectedUser) ? (
                  <img
                    src={getProfileUrl(selectedUser)}
                    alt="profile"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "var(--accent-1)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "600",
                    }}
                  >
                    {getInitial(selectedUser?.fullName || selectedUser?.email)}
                  </div>
                )}

                <span>{selectedUser?.fullName || selectedUser?.email}</span>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.sender._id === user._id
                          ? "flex-end"
                          : "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background:
                          msg.sender._id === user._id
                            ? "var(--accent-1)"
                            : "#f1f1f1",
                        color:
                          msg.sender._id === user._id
                            ? "#fff"
                            : "#000",
                        maxWidth: "60%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={{ padding: "14px", borderTop: "1px solid #eee", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#f0f2f5", borderRadius: "30px", padding: "8px 14px" }}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      resize: "none",
                      outline: "none",
                      fontSize: "15px",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      border: "none",
                      background: "var(--accent-1)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "38px",
                      height: "38px",
                      marginLeft: "8px",
                      cursor: "pointer",
                    }}
                  >
                    ➤
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}