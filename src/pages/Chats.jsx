import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://tutionmasterbacknend.onrender.com";

export default function Chats({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // =============================
  // AUTO SCROLL
  // =============================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =============================
  // LOAD USER
  // =============================
  useEffect(() => {
    API.get("/user/me")
      .then((res) => setUser(res.data))
      .catch(() => (window.location.href = "/"));
  }, []);

  // =============================
  // SOCKET INIT
  // =============================
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
      socket.emit("user:register", user._id);
    });

    socket.on("chat:message:new", (message) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // =============================
  // LOAD CHATS
  // =============================
  useEffect(() => {
    API.get("/chats")
      .then((res) => setChats(res.data || []))
      .catch(() => setChats([]));
  }, []);

  // =============================
  // SELECT CHAT
  // =============================
  const handleSelectChat = async (chatId) => {
    setSelectedChat(chatId);
    setMessages([]);

    try {
      const res = await API.get(`/chats/${chatId}/messages`);
      setMessages(res.data || []);

      socketRef.current?.emit("chat:join", chatId);

      // Mark as read
      await API.put(`/chats/${chatId}/mark-read`);
    } catch {
      setMessages([]);
    }
  };

  // =============================
  // SEND MESSAGE
  // =============================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setLoading(true);

    try {
      const res = await API.post(
        `/chats/${selectedChat}/messages`,
        { content: newMessage }
      );

      // Optimistic update
      setMessages((prev) => [...prev, res.data]);

      socketRef.current?.emit("chat:message", {
        chatId: selectedChat,
        message: res.data,
      });

      setNewMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      <div
        className={"overlay " + (isSidebarOpen ? "open" : "")}
        onClick={() => toggleSidebar && toggleSidebar(false)}
      />

      <div className={"sidebar " + (isSidebarOpen ? "open" : "closed")}>
        <Sidebar user={user} onNavigate={() => {}} />
      </div>

      <main className="main">
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", minHeight: "500px" }}>
          
          {/* CHAT LIST */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "16px" }}>
              <h3>Conversations</h3>
            </div>

            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  background:
                    selectedChat === chat._id
                      ? "rgba(201,163,94,0.1)"
                      : "transparent",
                }}
              >
                {chat.participants.find(p => p._id !== user._id)?.name || chat.chatName}
              </div>
            ))}
          </div>

          {/* MESSAGE AREA */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            {selectedChat ? (
              <>
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
                            msg.sender._id === user._id ? "#fff" : "#000",
                          maxWidth: "60%",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  style={{ display: "flex", padding: "16px", gap: "10px" }}
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    style={{ flex: 1 }}
                  />
                  <button disabled={loading}>
                    {loading ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ margin: "auto" }}>
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}