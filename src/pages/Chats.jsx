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

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // =============================
  // AUTO SCROLL
  // =============================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =============================
  // LOAD CURRENT USER
  // =============================
  useEffect(() => {
    API.get("/user/me")
      .then((res) => setUser(res.data))
      .catch(() => (window.location.href = "/"));
  }, []);

  // =============================
  // LOAD USERS
  // =============================
  useEffect(() => {
    if (!user) return;

    API.get("/user")
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]));
  }, [user]);

  // =============================
  // LOAD CHATS
  // =============================
  useEffect(() => {
    if (!user) return;

    API.get("/chats")
      .then((res) => setChats(res.data || []))
      .catch(() => setChats([]));
  }, [user]);

  // =============================
  // SOCKET INIT
  // =============================
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

  // =============================
  // START CHAT
  // =============================
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

  // =============================
  // LOAD MESSAGES
  // =============================
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

  // =============================
  // SEND MESSAGE
  // =============================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);

      const res = await API.post(
        `/chats/${selectedChat}/messages`,
        { content: newMessage }
      );

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

  // ENTER to send, SHIFT+ENTER for newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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
        <Sidebar user={user} />
      </div>

      <main className="main">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "20px",
            minHeight: "500px",
          }}
        >
          {/* LEFT PANEL */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "16px", fontWeight: "bold" }}>
              Users
            </div>

            {users.length === 0 && (
              <div style={{ padding: "16px", color: "#777" }}>
                No users found
              </div>
            )}

            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => handleStartChat(u._id)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f1f1f1",
                }}
              >
                {u.fullName || u.email}
              </div>
            ))}
          </div>

          {/* RIGHT PANEL */}
          <div
            className="card"
            style={{ display: "flex", flexDirection: "column" }}
          >
            {selectedChat ? (
              <>
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #eee",
                    fontWeight: "bold",
                  }}
                >
                  Chat
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px",
                  }}
                >
                  {loadingMessages ? (
                    <div>Loading messages...</div>
                  ) : (
                    messages.map((msg) => (
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
                            direction: "ltr",
                            textAlign: "left",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  style={{
                    display: "flex",
                    padding: "16px",
                    gap: "10px",
                    alignItems: "flex-end",
                  }}
                >
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={2}
                    style={{
                      flex: 1,
                      resize: "none",
                      direction: "ltr",
                      textAlign: "left",
                      padding: "10px 14px",
                      fontSize: "15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      minHeight: "50px",
                    }}
                  />

                  <button
                    disabled={sending}
                    style={{ height: "50px", padding: "0 20px" }}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ margin: "auto" }}>
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}