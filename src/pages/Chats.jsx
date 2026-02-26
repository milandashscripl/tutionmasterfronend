import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Update this to your backend URL
let socket = null;

export default function Chats({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/user/me").then((res) => setUser(res.data)).catch(() => { window.location.href = "/"; });
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!socket && user) {
      socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      socket.on("connect", () => {
        console.log("Connected to chat server");
        socket.emit("user:register", user._id);
      });

      socket.on("chat:message:new", (message) => {
        if (message.chatId === selectedChat) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from chat server");
      });

      return () => {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      };
    }
  }, [user]);

  useEffect(() => {
    // Load chats list
    API.get("/chats").then((res) => {
      setChats(res.data || []);
    }).catch(() => {
      setChats([]);
    });
  }, []);

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    setMessages([]);
    // Load messages for the chat
    API.get(`/chats/${chatId}/messages`).then((res) => {
      setMessages(res.data || []);
      // Join chat room via socket
      if (socket) {
        socket.emit("chat:join", chatId);
      }
    }).catch(() => {
      setMessages([]);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setLoading(true);
    try {
      const res = await API.post(`/chats/${selectedChat}/messages`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage("");
      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit("chat:message", { chatId: selectedChat, message: res.data });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      <div className={"overlay " + (isSidebarOpen ? "open" : "")} onClick={() => toggleSidebar && toggleSidebar(false)} />
      <div className={"sidebar " + (isSidebarOpen ? "open" : "closed")}>
        <Sidebar user={user} onNavigate={() => {}} />
      </div>

      <main className="main">
        <div className="hero">
          <div className="lead">
            <h2>Messages</h2>
            <p className="muted">Start a real-time conversation with your contacts</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", minHeight: "500px" }}>
          {/* Chat List */}
          <div className="card" style={{ maxWidth: "none", padding: "0", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(31,30,28,0.05)", backgroundColor: "var(--accent-2)" }}>
              <h3 style={{ margin: "0", fontSize: "1rem" }}>Conversations</h3>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
              {chats.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>
                  No conversations yet
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat._id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(31,30,28,0.03)",
                      cursor: "pointer",
                      backgroundColor: selectedChat === chat._id ? "rgba(201,163,94,0.1)" : "transparent",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(201,163,94,0.06)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedChat === chat._id ? "rgba(201,163,94,0.1)" : "transparent"}
                  >
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                      {chat.participants.find(p => p._id !== user._id)?.name || chat.chatName}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Click to open</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="card" style={{ maxWidth: "none", padding: "0", borderRadius: "12px", display: "flex", flexDirection: "column" }}>
            {selectedChat ? (
              <>
                <div style={{ padding: "16px", borderBottom: "1px solid rgba(31,30,28,0.05)", backgroundColor: "var(--accent-2)" }}>
                  <h3 style={{ margin: "0", fontSize: "1rem" }}>Chat</h3>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--muted)", marginTop: "auto", marginBottom: "auto" }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: msg.sender._id === user._id ? "flex-end" : "flex-start" }}>
                        <div
                          style={{
                            maxWidth: "60%",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            backgroundColor: msg.sender._id === user._id ? "var(--accent-1)" : "rgba(31,30,28,0.05)",
                            color: msg.sender._id === user._id ? "#fff" : "var(--text)",
                            wordWrap: "break-word",
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: "16px", borderTop: "1px solid rgba(31,30,28,0.05)", display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1, marginBottom: "0" }}
                  />
                  <button type="submit" disabled={loading} style={{ width: "auto", padding: "11px 20px" }}>
                    {loading ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" }}>
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
