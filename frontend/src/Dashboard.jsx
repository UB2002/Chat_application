import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newContactUsername, setNewContactUsername] = useState("");

  const token = localStorage.getItem("token");

  // ✅ Set default Authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // ✅ Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/contacts");
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ✅ Fetch messages (with polling)
  useEffect(() => {
    if (!selectedContact) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/messages/${selectedContact.id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages(); // load immediately
    const interval = setInterval(fetchMessages, 1000); // ⏳ poll every 3s

    return () => clearInterval(interval); // cleanup when contact changes/unmount
  }, [selectedContact]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    try {
      const res = await axios.post("http://localhost:3000/api/messages", {
        receiver_id: selectedContact.id,
        message: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // ✅ Add new contact
  const addContact = async () => {
    if (!newContactUsername.trim()) return;
    try {
      await axios.post("http://localhost:3000/api/contacts", {
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
                    m.sender_id === selectedContact.id
                      ? "text-left"
                      : "text-right"
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg shadow ${
                      m.sender_id === selectedContact.id
                        ? "bg-white text-gray-800"
                        : "bg-indigo-600 text-white"
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
