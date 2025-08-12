# WhatsApp Web Clone

A full-stack WhatsApp Web-like chat interface that displays real-time WhatsApp conversations using webhook data. Built with Node.js backend and React frontend.

## 🚀 Features

### Backend
- **Webhook Processing**: Handles WhatsApp Business API webhook payloads
- **MongoDB Integration**: Stores messages in `processed_messages` collection
- **Real-time Updates**: Socket.IO for live message and status updates
- **RESTful APIs**: Complete API for conversations and messages
- **Status Management**: Handles sent, delivered, and read message statuses

### Frontend
- **WhatsApp Web UI**: Pixel-perfect WhatsApp Web interface
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Messaging**: Live updates without page refresh
- **Message Status Indicators**: Visual status indicators (✓, ✓✓, ✓✓ blue)
- **Search Functionality**: Search through conversations
- **Date Separators**: Organized message display

## 🛠 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- CORS enabled

**Frontend:**
- React 18 + Vite
- Socket.IO Client
- Lucide React (icons)
- date-fns (date formatting)

## 📁 Project Structure

```
├── backend/
│   ├── models/
│   │   └── Message.js          # MongoDB message schema
│   ├── config/                 # Database configuration
│   ├── data/                   # Sample webhook payloads
│   ├── server.js              # Main server file
│   ├── payloads.js            # Payload processing script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     # Conversations list
│   │   │   ├── ChatWindow.jsx  # Main chat interface
│   │   │   └── WelcomeScreen.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
└── README.md
```

## Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Process Sample Payloads (Optional)

```bash
cd backend
npm run process-payloads
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook` | Process WhatsApp webhook payloads |
| GET | `/api/conversations` | Get all conversations |
| GET | `/api/conversations/:wa_id/messages` | Get messages for a conversation |
| POST | `/api/messages` | Send a new message |
| POST | `/api/messages/update-status` | Update message status |

## 🔄 Real-time Events

| Event | Description |
|-------|-------------|
| `new_message` | New message received or sent |
| `update_status` | Message status updated |

## 📱 Mobile Responsiveness

The interface is fully responsive with:
- Mobile-first design
- Touch-friendly interactions
- Optimized layouts for all screen sizes
- Native app-like experience on mobile



## 🧪 Testing Webhook Integration

Send POST requests to `/api/webhook` with sample payloads:

```json
{
  "metaData": {
    "entry": [{
      "changes": [{
        "value": {
          "contacts": [{
            "profile": {"name": "John Doe"},
            "wa_id": "1234567890"
          }],
          "messages": [{
            "id": "wamid.123",
            "from": "1234567890",
            "timestamp": "1640995200",
            "text": {"body": "Hello World!"}
          }]
        }
      }]
    }]
  }
}
```

## 🎯 Key Features Implemented

- ✅ Webhook payload processing
- ✅ MongoDB message storage
- ✅ Real-time message updates
- ✅ WhatsApp Web-like UI
- ✅ Mobile responsive design
- ✅ Message status indicators
- ✅ Conversation grouping
- ✅ Send message functionality
- ✅ Search conversations
- ✅ Date separators
- ✅ Socket.IO real-time updates

