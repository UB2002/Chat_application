import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const api = import.meta.env.VITE_API || "http://localhost:3000";


export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newContactUsername, setNewContactUsername] = useState("");
  const socket = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Set default Authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // WebSocket connection
  useEffect(() => {
    if (token) {
      socket.current = io(`${api}`, {
        auth: { token },
      });

      socket.current.on("connect", () => {
        console.log("Socket connected");
      });

      socket.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.current.on("message_receive", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [token]);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${api}/api/contacts`);
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch initial messages
  useEffect(() => {
    if (!selectedContact) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${api}/api/messages/${selectedContact.id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedContact]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !socket.current) return;

    const messagePayload = {
      receiver_id: selectedContact.id,
      message: newMessage,
    };

    socket.current.emit("message_send", messagePayload);
    setNewMessage("");
  };

  // Add new contact
  const addContact = async () => {
    if (!newContactUsername.trim()) return;
    try {
      await axios.post(`${api}/api/contacts`, {
        username: newContactUsername,
      });
      setNewContactUsername("");
      await fetchContacts(); // refresh contact list
    } catch (err) {
      console.error("Error adding contact:", err);
      alert(err.response?.data?.error || "Could not add contact");
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 md:w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-700">Chats</h1>
        </div>

        {/* Add Contact */}
        <div className="p-4 border-b border-gray-300 flex gap-2">
          <input
            type="text"
            placeholder="Add contact username"
            value={newContactUsername}
            onChange={(e) => setNewContactUsername(e.target.value)}
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addContact}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContact(c)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-200 hover:bg-gray-100 ${
                selectedContact?.id === c.id ? "bg-gray-200" : ""
              }`}
            >
              <p className="font-semibold text-gray-800">{c.username}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-white">
              <h2 className="font-semibold text-gray-700">
                {selectedContact.username}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-4 ${
                    m.sender_id === user.id
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg shadow ${
                      m.sender_id === user.id
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-300 flex">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={sendMessage}
                className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a contact to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
}