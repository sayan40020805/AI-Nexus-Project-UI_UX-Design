# Post Creation Feature - Architecture & Diagrams

## Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        PostForm (Main)                       │
│                    State: selectedType                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────────┐    ┌──────────────────────┐
│ PostTypeSelector  │    │ Form Wrapper         │
│                   │    │ (Conditional)        │
│ - 5 Type Cards    │    │                      │
│ - Click Handler   │    │ ┌──────────────────┐ │
│ - Active State    │    │ │ AiNewsForm       │ │
└───────────────────┘    │ │ AiShortsForm     │ │
                         │ │ AiModelsForm     │ │
                         │ │ AiShowcaseForm   │ │
                         │ │ NormalPostForm   │ │
                         │ └──────────────────┘ │
                         └──────────────────────┘

        ┌────────────────────────────────────┐
        ▼                                     ▼
┌──────────────────────┐        ┌────────────────────────┐
│ PostTypeAnimation    │        │ Submit Button/Callback │
│                      │        │                        │
│ - Canvas Element     │        │ - Form Validation      │
│ - requestAnimFrame   │        │ - onSubmit Handler     │
│ - Shape Rendering    │        │ - Loading State        │
│ - Cleanup           │        └────────────────────────┘
└──────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────┐
│   User Selects Type     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  setState(selectedType) │  ← Triggers re-render
└────────┬────────────────┘
         │
    ┌────┴──────────────────────┐
    │                           │
    ▼                           ▼
┌──────────────┐    ┌──────────────────┐
│ Animation    │    │ Form Component   │
│ Updates      │    │ Renders          │
└──────────────┘    └────────┬─────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
              ┌──────────┐      ┌──────────┐
              │ User     │      │ Animation│
              │ Fills    │      │ Changes  │
              │ Form     │      │ Shape &  │
              └────┬─────┘      │ Color    │
                   │            └──────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Form Submission  │
          │ onSubmit Called  │
          │ with Form Data   │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ API Call / Store │
          │ Data Processed   │
          └──────────────────┘
```

---

## State Management

```
PostForm
├── State Variables
│   ├── selectedType: string | null
│   │   │   Values: 'ai_news', 'ai_shorts', 'ai_models', 
│   │   │          'ai_showcase', 'normal_post', null
│   │   │
│   │   └── Updated by: onTypeChange()
│   │
│   └── formSubmitted: boolean
│       │   Initial: false
│       │   Purpose: Show loading state
│       │
│       └── Updated by: handleFormSubmit()
│
└── Event Handlers
    ├── handleTypeChange(typeId)
    │   ├── Sets selectedType
    │   └── Resets formSubmitted
    │
    └── handleFormSubmit(data)
        ├── Logs form data
        ├── Sets loading state
        ├── Simulates API call
        └── Shows success message
```

---

## Form Field Mapping

```
╔════════════════════════════════════════════════════════════════╗
║                     POST TYPE FIELDS                           ║
╠════════════════════════════════════════════════════════════════╣

AI News (ai_news)
├── title (required, 200 char)
├── summary (required, 1000 char)
├── sourceLink (optional, URL)
└── thumbnail (optional, file)

AI Shorts (ai_shorts)
├── caption (required, 500 char)
├── video (required, file)
└── tags (optional, 200 char)

AI Models (ai_models)
├── modelName (required, 100 char)
├── description (required, 1500 char)
├── useCase (required, 1000 char)
├── githubLink (optional, URL)
└── apiLink (optional, URL)

AI Showcase (ai_showcase)
├── title (required, 200 char)
├── description (required, 3000 char)
├── videoUrl (conditional, URL)
├── videoUpload (conditional, file)
└── videoSource ('url' | 'upload')

Normal Post (normal_post)
├── title (optional, 200 char)
├── content (required, 5000 char)
└── image (optional, file)

╚════════════════════════════════════════════════════════════════╝
```

---

## Animation State Machine

```
                    ┌──────────────
                    │
                    ▼
         ┌────────────────────┐
         │  No Type Selected  │◄─────────────────┐
         │  (Empty State)     │                  │
         └────────┬───────────┘                  │
                  │ User clicks type             │
                  ▼                              │
    ┌─────────────────────────┐                 │
    │  Animate Shape Entry    │                 │
    │  (fadeIn 0.3s)          │                 │
    └────────┬────────────────┘                 │
             │                                  │
             ▼                                  │
    ┌─────────────────────────┐                 │
    │  Shape Animation Loop   │                 │
    │  - Rotation             │                 │
    │  - Particles            │                 │
    │  - Orbits               │                 │
    └────────┬────────────────┘                 │
             │                                  │
             ├─ Type changes ──────────────┐    │
             │                            │    │
             │                    ┌───────▼────┴─────┐
             │                    │  Shape Transition│
             │                    │  (smooth color)  │
             │                    └───────┬──────────┘
             │                            │
             └────────────────────────────┘ (loop continues)
```

---

## File Dependency Graph

```
PostForm.jsx
├── imports
│   ├── PostTypeSelector.jsx
│   ├── AiNewsForm.jsx
│   ├── AiShortsForm.jsx
│   ├── AiModelsForm.jsx
│   ├── AiShowcaseForm.jsx
│   ├── NormalPostForm.jsx
│   ├── PostTypeAnimation.jsx
│   └── PostCreation.css

PostTypeSelector.jsx
└── imports
    └── PostCreation.css

PostTypeAnimation.jsx
└── imports
    └── PostCreation.css

All Forms (AiNewsForm, etc.)
└── Self-contained (no internal imports)

index.js
└── Re-exports all components

CreatePostPage.jsx
└── imports
    └── PostForm from index.js
```

---

## Color Scheme Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   POST TYPE COLORS                      │
├─────────────────────────────────────────────────────────┤

📰 AI News
   Primary:    #FF6B6B (Coral Red)
   Hover:      Darker shade with shadow
   Active:     Scaled 1.05 with glow
   Text:       White when active

🎬 AI Shorts
   Primary:    #4ECDC4 (Teal)
   Hover:      Darker shade with shadow
   Active:     Scaled 1.05 with glow
   Text:       White when active

🤖 AI Models
   Primary:    #95E1D3 (Mint Green)
   Hover:      Darker shade with shadow
   Active:     Scaled 1.05 with glow
   Text:       White when active

🎥 AI Showcase
   Primary:    #FFD93D (Gold)
   Hover:      Darker shade with shadow
   Active:     Scaled 1.05 with glow
   Text:       White when active

📝 Normal Post
   Primary:    #A8D8EA (Light Blue)
   Hover:      Darker shade with shadow
   Active:     Scaled 1.05 with glow
   Text:       White when active

└─────────────────────────────────────────────────────────┘
```

---

## Responsive Layout Breakpoints

```
Desktop (≥1024px)
┌─────────────────────────────────────────┐
│         POST FORM CONTAINER             │
├──────────────────┬──────────────────────┤
│                  │                      │
│  LEFT (Form)     │  RIGHT (Animation)   │
│                  │                      │
│  - Type Selector │  - Canvas (500px)    │
│  - Form Fields   │  - Animation Label   │
│  - Submit Button │                      │
│                  │                      │
└──────────────────┴──────────────────────┘

Tablet (768px - 1023px)
┌──────────────────────────────┐
│   POST FORM CONTAINER        │
├──────────────────────────────┤
│                              │
│  Type Selector               │
│                              │
│  Form Fields                 │
│                              │
│  Canvas (350px height)       │
│                              │
│  Submit Button               │
│                              │
└──────────────────────────────┘

Mobile (480px - 767px)
┌──────────────────┐
│ TYPE SELECTOR    │
│  (5 small cards) │
├──────────────────┤
│  FORM FIELDS     │
│  (compact)       │
├──────────────────┤
│  ANIMATION       │
│  (300px height)  │
├──────────────────┤
│ SUBMIT BUTTON    │
└──────────────────┘

Small Mobile (<480px)
┌────────────┐
│   TYPES    │
│ (minimal)  │
├────────────┤
│   FORM     │
│  (minimal) │
├────────────┤
│  ANIMATION │
│  (250px)   │
├────────────┤
│  BUTTON    │
└────────────┘
```

---

## Animation Pipeline

```
requestAnimationFrame Loop
    │
    ├─► Clear Canvas
    │
    ├─► Update rotation counter
    │   rotation += config.speed
    │
    ├─► Draw Background Gradient
    │
    ├─► Draw Particles (3 orbiting)
    │   └─ Position: 100px radius
    │
    ├─► Draw Main Shape (based on type)
    │   ├─ Newspaper (for ai_news)
    │   ├─ Film Reel (for ai_shorts)
    │   ├─ Cube (for ai_models)
    │   ├─ Sphere (for ai_showcase)
    │   └─ Pyramid (for normal_post)
    │
    ├─► Draw Orbiting Dots (4 items)
    │   └─ Position: 120px radius
    │
    └─► Schedule next frame
```

---

## CSS Cascade Overview

```
PostCreation.css Structure
│
├─ Post Form Container Styles
│  ├─ Layout Grid
│  ├─ Header Styling
│  └─ Two-column Layout
│
├─ Post Type Selector Styles
│  ├─ Grid Layout
│  ├─ Card Styling
│  ├─ Hover States
│  └─ Active States
│
├─ Form Styles
│  ├─ Form Groups
│  ├─ Input Fields
│  ├─ Textarea Styling
│  ├─ File Inputs
│  ├─ Character Counters
│  └─ Form Rows
│
├─ Animation Container Styles
│  ├─ Canvas Container
│  ├─ Empty State
│  └─ Animation Labels
│
├─ Button Styles
│  ├─ Normal State
│  ├─ Hover State
│  ├─ Active State
│  └─ Disabled State
│
├─ Animations/Keyframes
│  ├─ fadeIn
│  ├─ slideIn
│  ├─ slideUp
│  ├─ float
│  ├─ spin
│  └─ pulseLight
│
├─ Dark Mode Styles
│  ├─ Background Colors
│  ├─ Text Colors
│  └─ Border Colors
│
└─ Responsive Breakpoints
   ├─ Tablet (1024px)
   ├─ Mobile (768px)
   └─ Small Mobile (480px)
```

---

## Component Lifecycle

```
PostForm Component
│
├─ Mount
│  ├─ Initialize state: selectedType = null
│  ├─ Initialize state: formSubmitted = false
│  └─ Render JSX
│
├─ Update (user selects type)
│  ├─ setState(selectedType)
│  ├─ Re-render PostTypeSelector
│  └─ Re-render PostTypeAnimation
│
├─ Update (user fills form)
│  ├─ Form state updates (in form component)
│  └─ Form component re-renders
│
├─ Update (user submits)
│  ├─ handleFormSubmit called
│  ├─ setState(formSubmitted = true)
│  ├─ Show loading state
│  ├─ Simulate API call
│  ├─ setState(formSubmitted = false)
│  └─ Show success message
│
└─ Unmount
   └─ Cleanup (none needed for this component)
```

---

## Network & Performance Timeline

```
Page Load
    │
    ├─► 0ms:   Request HTML
    │
    ├─► 50ms:  PostForm Component loads
    │   ├─► Parse JSX
    │   ├─► Initialize State
    │   └─► Render UI
    │
    ├─► 100ms: CSS loads and applies
    │   ├─► Animations enabled
    │   └─► Layout stabilizes
    │
    ├─► 150ms: User can interact
    │
    ├─► 200ms: User selects type
    │   ├─► State updates
    │   ├─► Re-render (5ms)
    │   ├─► Animation starts (60fps)
    │   └─► User sees result
    │
    └─► Ongoing: Animation continues (60fps)
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Easy maintenance and extension
