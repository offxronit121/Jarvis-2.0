# 🦾 JARVIS 2.0
### Iron Man-Style 3D Hand Gesture Interface

![Version](https://img.shields.io/badge/version-2.0.0-00F2FF?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-00F2FF?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r184-00F2FF?style=for-the-badge&logo=threedotjs)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-FF4E00?style=for-the-badge)

> Control a 3D holographic interface using only your hands — just like Tony Stark.

</div>

---

## ✨ Features

- 🖐️ **Dual Hand Tracking** — Both hands detected simultaneously via webcam
- ✍️ **3D Air Drawing** — Draw strokes in 3D space using your index finger
- ✊ **Grab & Move** — Pick up and move 3D objects using pinch gesture
- 🔄 **Rotate Objects** — Use two fingers (V sign) to rotate
- 🔍 **Pinch to Zoom** — Zoom in/out like a mobile screen using both hands
- 🎨 **Color-coded Hand Skeleton** — Each finger tracked with unique color dots
- 💻 **Iron Man HUD** — Holographic overlay with live gesture logs and metrics

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI Framework |
| **Three.js + R3F** | 3D Rendering |
| **MediaPipe Hands** | Hand & Gesture Tracking |
| **Zustand** | Global State Management |
| **Tailwind CSS v4** | Styling & HUD Design |
| **Vite** | Build Tool |
| **TypeScript** | Type Safety |

---

## 🖐️ Gesture Controls

| Gesture | Hand | Action |
|---|---|---|
| ☝️ Index finger up | Right | **Draw** in 3D space |
| ✊ Fist closed | Right | **Grab** and move object |
| ✌️ Two fingers (V) | Right | **Rotate** object |
| 🤏 Pinch (both hands) | Both | **Zoom** in / out |
| 🖐️ Open palm | Either | **Release** / stop drawing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Webcam
- Modern browser (Chrome recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/jarvis-2.0.git

# Go into the folder
cd jarvis-2.0

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser and allow camera access.

---

## 📁 Project Structure

```
jarvis-2.0/
├── index.html
├── src/
│   ├── App.tsx                   # Main layout
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Iron Man theme
│   ├── components/
│   │   ├── HandTracker.tsx       # Camera + MediaPipe tracking
│   │   ├── ThreeScene.tsx        # 3D scene + drawing + gestures
│   │   └── HUD.tsx               # Holographic overlay UI
│   ├── store/
│   │   └── useStore.ts           # Global state (Zustand)
│   └── utils/
│       └── gestureUtils.ts       # Gesture recognition + smoothing
├── package.json
└── vite.config.ts
```

---

## 🌐 Deploy

Deployed on **Vercel** — [Live Demo](https://jarvis-2-0-neon.vercel.app/)

---

## 🎬 Inspiration

- **Iron Man** — Tony Stark's holographic gesture interface
- **Minority Report** — Mid-air gesture manipulation
- **Doctor Strange** — Hand-traced light drawings

---

## 📄 License

MIT License — feel free to use and modify.

---

<div align="center">
Made with ❤️ GAURAV SHISWAR
</div>
```
