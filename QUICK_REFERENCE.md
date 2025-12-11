# Quick Reference Guide - AI Nexus Project

## 🚀 Quick Start

### Start Development
```bash
cd /workspaces/AI-Nexus-Project-UI_UX-Design/Ai_Nexus
npm run dev
```
**Access**: http://localhost:5174

### Build for Production
```bash
npm run build
```
**Output**: dist/ directory

---

## 📍 Page Locations & Routes

| Page | File | Route | Sidebar |
|------|------|-------|---------|
| Home | src/App.jsx | / | N/A |
| Live Streams | src/pages/Live/Live.jsx | /live | ✅ Yes |
| Quiz | src/pages/Quiz/Quiz.jsx | /quiz | ✅ Yes |
| Post | src/pages/Post/Post.jsx | /post | ✅ Yes |
| ATS Score | src/pages/ATSScore/ATSScore.jsx | /ats | ✅ Yes |
| AI Shorts | src/pages/AIShorts/AiShorts.jsx | /shorts | ✅ Yes |
| Login | src/pages/Login/Login.jsx | /login | ❌ Direct |
| Register | src/pages/Register/Register.jsx | /register | ❌ Direct |
| Dashboard | src/pages/Dashboard/Dashboard.jsx | /dashboard | ❌ Direct |

---

## 🎨 Color Theme

```css
--bg: #0a0e27;              /* Deep black background */
--text: #e0f7ff;            /* Bright cyan text */
--primary: #7dd3fc;         /* Sky blue primary */
--accent: #06b6d4;          /* Cyan accent */
```

---

## 📱 Responsive Breakpoints

```
Desktop:     1024px+
Tablet:      768px - 1024px
Mobile:      640px - 768px
Small Mobile: < 640px
```

---

## 📂 Key Files

### Core Application
- **src/App.jsx** - Main routing and navigation
- **src/main.jsx** - Entry point
- **src/index.css** - Base styles
- **src/App.css** - Layout styles

### Components
- **src/components/Header.jsx** - Top navigation
- **src/components/ModernSidebar.jsx** - Sidebar navigation
- **src/components/Footer.jsx** - Footer

### Pages
- **src/pages/Live/Live.jsx** - Live streams
- **src/pages/Quiz/Quiz.jsx** - Quiz system
- **src/pages/Post/Post.jsx** - Post creation
- **src/pages/ATSScore/ATSScore.jsx** - ATS analyzer
- **src/pages/AIShorts/AiShorts.jsx** - AI shorts

### Styles
- **src/styles/globals.css** - Global variables
- **src/styles/Live.css** - Live page styles
- **src/styles/Quiz.css** - Quiz page styles
- **src/styles/Post.css** - Post page styles
- **src/styles/ATSScore.css** - ATS page styles
- **src/styles/AIShorts.css** - Shorts page styles

---

## 🔗 Adding a New Page

### Step 1: Create Component
```jsx
// src/pages/NewPage/NewPage.jsx
import '../../styles/NewPage.css';

export default function NewPage() {
  return <div className="new-page">Content</div>;
}
```

### Step 2: Create CSS
```css
/* src/styles/NewPage.css */
.new-page {
  /* Your styles */
}
```

### Step 3: Update App.jsx
```jsx
// Add import
import NewPage from './pages/NewPage/NewPage';
import './styles/NewPage.css';

// Add case in renderSection()
case 'newpage':
  return <NewPage />;

// Add route
<Route path="/newpage" element={<div className="page-with-header"><Header /><NewPage /><Footer /></div>} />
```

### Step 4: Update Sidebar
```jsx
// src/components/ModernSidebar.jsx
const sidebarItems = [
  // ... existing items
  { id: 'newpage', label: 'New Page', icon: YourIcon },
];
```

---

## 🎯 Navigation Patterns

### Internal Navigation (within MainApp)
```jsx
<button onClick={() => handleNavigate('quiz')}>Go to Quiz</button>
```

### Direct URL Navigation
```
http://localhost:5174/quiz
http://localhost:5174/live
http://localhost:5174/ats
```

### From Header
```jsx
<Link to="/login">Login</Link>
```

---

## 🛠 Common Tasks

### Change Primary Color
Edit `src/styles/globals.css`:
```css
--primary: #your-color;
--primary-600: #darker-shade;
--primary-dark: #darkest-shade;
```

### Add New Sidebar Item
Edit `src/components/ModernSidebar.jsx`:
```jsx
{ id: 'newitem', label: 'New Item', icon: IconComponent }
```

### Adjust Responsive Breakpoint
Edit `src/styles/App.css`:
```css
@media (max-width: 1200px) {
  /* Your styles */
}
```

### Add New Icon
Import from `lucide-react`:
```jsx
import { YourIcon } from 'lucide-react';
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
# Kill process on port 5173/5174
# Server will auto-use next available port
```

### CSS Not Loading
- Verify import path in component
- Check file name case sensitivity
- Ensure CSS file exists in `src/styles/`

### Route Not Found
- Verify route path in App.jsx
- Check component import
- Ensure default export exists

---

## 📊 Project Statistics

- **Total Pages**: 9
- **Total Routes**: 9+
- **Components**: 15+
- **CSS Files**: 7
- **Bundle Size**: ~335 kB
- **Build Time**: 1.2 seconds
- **Dependencies**: 30+

---

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:19
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5174
CMD ["npm", "run", "dev"]
```

---

## 📚 Useful Links

- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- React Router: https://reactrouter.com
- Lucide Icons: https://lucide.dev
- Tailwind CSS: https://tailwindcss.com

---

## 👥 Team Guidelines

### Code Style
- Use functional components
- Use React hooks for state
- Keep components focused
- Use meaningful class names

### Naming Convention
- Files: PascalCase for components, kebab-case for utilities
- CSS Classes: kebab-case (e.g., `.live-stream-card`)
- Variables: camelCase

### File Organization
```
src/
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── Footer.jsx
├── pages/
│   ├── PageName/
│   │   ├── PageName.jsx
│   │   └── PageName.css
├── styles/
│   └── *.css
├── App.jsx
└── main.jsx
```

---

## ✅ Pre-Deployment Checklist

- [ ] npm run build - No errors
- [ ] All routes tested
- [ ] Responsive design checked
- [ ] No console errors
- [ ] Images optimized
- [ ] Links working
- [ ] Forms tested
- [ ] Mobile tested
- [ ] Performance checked
- [ ] Accessibility reviewed

---

## 📞 Support

For issues or questions:
1. Check [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)
2. Review [CODE_CHANGES.md](CODE_CHANGES.md)
3. Check [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)

---

**Last Updated**: December 11, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
