#  Snap-to-Chat

Rediscover your Snapchat chats — the smart way.

Got tons of Snapchat messages but no way to search or browse them easily?  
**Snap-to-Chat** turns your raw data into a clean, searchable chat experience.

##  How it works
1. Download your Snapchat data (JSON)
2. Upload it here
3. Done 🎉

##  Features
- 📅 Chats organized by month  
- 🔍 Search messages instantly  
- 💬 Clean, readable chat UI  

##  Privacy
We **do NOT store your chats**. Your data stays yours.

---

Relive your memories, without the mess.

## Technical Details

### Tech Stack
- Frontend: React (Vite)
- State Management: Zustand
- Styling: Tailwind CSS
- Backend: Node.js with Express
- File Uploads: Cloudinary integration

### Architecture
- Single Page Application (SPA) built with React
- Client-side parsing and rendering of Snapchat JSON data
- Modular component-based UI for chat, sidebar, and message views
- REST API for handling uploads and media processing

### Core Functionality
- Parses Snapchat export JSON into structured chat data
- Groups messages by user and date
- Implements search functionality across all messages
- Displays chats in a conversational UI format

### Performance Optimizations
- Lazy loading of chat data
- Efficient state updates using Zustand
- Optimized rendering for large chat histories

### Deployment
- Frontend hosted on Vercel
- Backend can be deployed on platforms like Render or Railway

---
