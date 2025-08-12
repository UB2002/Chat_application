# WhatsApp Web Clone - Frontend

A responsive WhatsApp Web-like interface built with React and Vite that displays real-time WhatsApp conversations using webhook data.

## Features

- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 💬 **Real-time Messaging**: Live updates using Socket.IO
- 🎨 **WhatsApp Web UI**: Authentic WhatsApp Web look and feel
- 📊 **Message Status**: Shows sent, delivered, and read status indicators
- 🔍 **Search**: Search through conversations
- 📅 **Date Separators**: Organized message display with date separators
- ⚡ **Fast Performance**: Built with Vite for optimal performance

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icons
- **date-fns** - Date formatting utilities

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running (see backend folder)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Environment Variables

- `VITE_API_BASE` - Backend API URL (leave empty for same origin)

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Conversations list
│   ├── ChatWindow.jsx       # Main chat interface
│   ├── WelcomeScreen.jsx    # Landing screen
│   └── *.css               # Component styles
├── App.jsx                 # Main app component
├── App.css                # Global app styles
├── index.css              # Global styles
└── main.jsx               # App entry point
```

## API Integration

The frontend integrates with the following backend endpoints:

- `GET /api/conversations` - Fetch all conversations
- `GET /api/conversations/:wa_id/messages` - Fetch messages for a conversation
- `POST /api/messages` - Send a new message
- WebSocket events: `new_message`, `update_status`

## Mobile Responsiveness

The app is fully responsive with:
- Mobile-first design approach
- Touch-friendly interface
- Optimized layouts for different screen sizes
- Native-like mobile experience

## Deployment

The app can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **Render**
- **Heroku**
- Any static hosting service

For production deployment, make sure to:
1. Set the correct `VITE_API_BASE` environment variable
2. Build the project with `npm run build`
3. Deploy the `dist` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both desktop and mobile
5. Submit a pull request

## License

MIT License