# SocioConnect

A modern, Twitter/Threads-like social media platform built with Next.js and FastAPI.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Post Creation**: Create and share text posts with media support
- **Social Interactions**: Like, comment, repost, and bookmark posts
- **Real-time Feed**: Personalized timeline with following-based content
- **Explore**: Discover trending posts and topics
- **Messaging**: Direct messaging between users
- **Notifications**: Real-time notification system
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Heroicons** for consistent iconography

### Backend (Coming Soon)
- **FastAPI** (Python) with JWT authentication
- **PostgreSQL** for data persistence
- **Redis** for caching and real-time features
- **Local filesystem** for media storage (S3 ready)

## 🎨 Design System

- **Color Palette**: Purple-pink gradient theme with cyan accents
- **Typography**: Modern, clean fonts with proper hierarchy
- **Components**: Glass morphism design with smooth animations
- **Responsive**: Mobile-first design approach

## 📁 Project Structure

```
SocioConnect/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   └── components/      # Reusable UI components
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # FastAPI backend (coming soon)
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SocioConnect
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features

### Post System
- Create posts with text content
- Character limit (280 characters)
- Real-time character counter
- Media attachment support (coming soon)

### Social Features
- Follow/unfollow users
- Like and unlike posts
- Comment on posts
- Repost/share content
- Bookmark posts for later

### User Experience
- Smooth animations and transitions
- Responsive design for all devices
- Dark/light mode support
- Accessibility features

## 🔧 Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling

### Component Structure
- Reusable UI components
- Proper TypeScript interfaces
- Responsive design patterns
- Accessibility considerations

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🎨 UI/UX Features

- **Glass Morphism**: Modern translucent design elements
- **Gradient Accents**: Beautiful purple-pink color scheme
- **Smooth Animations**: 60fps transitions and micro-interactions
- **Interactive Elements**: Hover effects and visual feedback
- **Typography**: Clean, readable font hierarchy

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Frontend UI/UX
- ✅ Authentication pages
- ✅ Post creation and display
- ✅ Social interactions

### Phase 2 (Next)
- 🔄 Backend API development
- 🔄 Database integration
- 🔄 Real-time features
- 🔄 Media upload support

### Phase 3 (Future)
- 📋 Advanced search
- 📋 Content moderation
- 📋 Analytics dashboard
- 📋 Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible component primitives
- Heroicons for the beautiful icon set

---

**Built with ❤️ for the social media community**
