import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
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
  const [searchTerm, setSearchTerm] = useState(""); // NEW: Search state
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

  // UPDATED: Combined Filter for Tabs + Search
  const filteredUsers = users.filter((u) => {
    if (!u.isApproved || !u.isVerified) return false;

    const matchesTab = activeTab === "all" || u.registrationType?.toLowerCase() === activeTab;
    
    const name = (u.fullName || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
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
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
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

      // Show notification for new messages in other chats
      if (selectedChat !== message.chatId && Notification.permission === 'granted') {
        const notification = new Notification(`New message from ${message.sender.fullName || message.sender.email}`, {
          body: message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content,
          icon: getProfileUrl(message.sender) || '/favicon.ico'
        });

        notification.onclick = () => {
          setSelectedChat(message.chatId);
          loadMessages(message.chatId);
          window.focus();
        };
      }
    });

    return () => socket.disconnect();
  }, [user]);

  const handleStartChat = async (otherUserId) => {
    const targetUser = users.find(u => u._id === otherUserId);
    if (!targetUser?.isApproved || !targetUser?.isVerified) {
      alert("User is not approved by admin yet.");
      return;
    }

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
  const selectedUser = selectedChatData?.participants?.find((p) => p._id !== user?._id);

  if (!user) return <Loader message="Loading chats..." className="mx-auto" />;

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

      <main className="main" style={{ padding: "10px", width: "100%" }}>
        <div className="card" style={{ width: "100%", height: "calc(100vh - 100px)", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          
          {!selectedChat ? (
            <>
              <div style={{ padding: "16px", fontWeight: "bold", borderBottom: "1px solid #eee" }}>
                Messages
              </div>

              {/* SEARCH BAR */}
              <div style={{ padding: "10px 16px", background: "#fff", borderBottom: "1px solid #eee" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#f3f4f6", padding: "8px 14px", borderRadius: "10px" }}>
                  <span style={{ marginRight: "10px", opacity: 0.5 }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "16px" }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} style={{ border: "none", background: "none", cursor: "pointer", opacity: 0.5 }}>✕</button>
                  )}
                </div>
              </div>

              {/* TABS */}
              <div style={{ display: "flex", borderBottom: "1px solid #eee", background: "#fff", overflowX: "auto" }}>
                {["all", "teacher", "student", "admin"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      minWidth: "80px",
                      padding: "12px",
                      border: "none",
                      cursor: "pointer",
                      background: activeTab === tab ? "var(--accent-1)" : "transparent",
                      color: activeTab === tab ? "#fff" : "#333",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      transition: "0.2s"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* USER LIST */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: "40px 16px", color: "#777", textAlign: "center" }}>
                    No users found matching "{searchTerm}"
                  </div>
                ) : (
                  filteredUsers.map((u) => (
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
                        <img src={getProfileUrl(u)} alt="profile" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>
                          {getInitial(u.fullName || u.email)}
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "500" }}>{u.fullName || u.email}</span>
                        <span style={{ fontSize: "12px", color: "#22c55e" }}>✓ Verified {u.registrationType}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div style={{ padding: "10px 15px", borderBottom: "1px solid #eee", fontWeight: "bold", display: "flex", alignItems: "center", gap: "12px", background: "#fff" }}>
                <button
                  onClick={() => { setSelectedChat(null); setMessages([]); }}
                  style={{ border: "none", background: "none", cursor: "pointer", fontSize: "22px", padding: "5px" }}
                >
                  ←
                </button>

                {getProfileUrl(selectedUser) ? (
                  <img src={getProfileUrl(selectedUser)} alt="profile" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "var(--accent-1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    {getInitial(selectedUser?.fullName || selectedUser?.email)}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "15px" }}>{selectedUser?.fullName || selectedUser?.email}</span>
                  <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal" }}>Online</span>
                </div>
              </div>

              {/* MESSAGES */}
              <div style={{ flex: 1, overflowY: "auto", padding: "15px", background: "#f9f9f9" }}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      justifyContent: msg.sender._id === user._id ? "flex-end" : "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: msg.sender._id === user._id ? "15px 15px 2px 15px" : "15px 15px 15px 2px",
                        background: msg.sender._id === user._id ? "var(--accent-1)" : "#fff",
                        color: msg.sender._id === user._id ? "#fff" : "#333",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        maxWidth: "75%",
                        wordBreak: "break-word",
                        fontSize: "14px"
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA */}
              <form onSubmit={handleSendMessage} style={{ padding: "10px", borderTop: "1px solid #eee", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#f0f2f5", borderRadius: "25px", padding: "5px 15px" }}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message..."
                    rows={1}
                    style={{ flex: 1, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: "15px", padding: "8px 0" }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    style={{ border: "none", background: "none", color: "var(--accent-1)", fontSize: "20px", cursor: "pointer", padding: "5px", opacity: newMessage.trim() ? 1 : 0.5 }}
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