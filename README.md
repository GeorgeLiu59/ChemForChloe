# Chem for Chloe - AI Chemistry Assistant

A modern web application that helps students with chemistry by providing AI-powered molecular drawing, reaction mechanism visualization, and interactive chemistry assistance.

## 🧪 Features

### 📸 Image Upload & Processing
- **Drag & Drop Interface**: Easy image upload with visual feedback
- **Multiple Formats**: Supports JPG, PNG, GIF, BMP, WebP (up to 10MB)
- **AI Analysis**: Processes chemistry questions from uploaded images
- **Real-time Processing**: Visual feedback during analysis

### 🧬 Molecular Structure Viewer
- **Interactive 3D-like Rendering**: Canvas-based molecular visualization
- **Zoom Controls**: Pan, zoom, and rotate molecular structures
- **SMILES Support**: Chemical notation for molecular representation
- **Download Capability**: Export molecular structures as images
- **Multiple Molecules**: Switch between different identified compounds

### ⚗️ Reaction Mechanism Visualizer
- **Step-by-Step Animation**: Interactive reaction mechanism display
- **Play/Pause Controls**: Control the pace of mechanism visualization
- **Progress Tracking**: Visual progress indicator through reaction steps
- **Detailed Explanations**: Chemical explanations for each step
- **Multiple Reactions**: Support for various reaction types

### 🤖 AI Chemistry Assistant
- **Interactive Chat**: Natural language chemistry Q&A
- **Quick Questions**: Pre-built common chemistry questions
- **Comprehensive Explanations**: Detailed responses with examples
- **Visual Aids**: ASCII art and structured explanations
- **Real-time Responses**: Instant chemistry help

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chem-for-chloe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **File Upload**: React Dropzone
- **Molecular Drawing**: Canvas API, RDKit.js
- **Notifications**: React Hot Toast
- **AI Integration**: Google Gemini API (configurable)

## 📁 Project Structure

```
chem-for-chloe/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── ImageUpload.tsx    # File upload component
│   ├── MoleculeViewer.tsx # Molecular structure viewer
│   ├── ReactionMechanism.tsx # Reaction mechanism visualizer
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## 🎯 Usage Examples

### Uploading Chemistry Questions
1. Drag and drop an image or click to browse in the upload area
2. Wait for AI analysis (2-3 seconds)
3. View all results on the same page - molecules, reactions, and analysis

### Viewing Molecular Structures
1. Upload an image with molecular structures
2. View interactive 3D molecular structures with PubChem data
3. Use zoom controls and switch between MolView and 3D modes
4. Download high-quality molecular images

### Understanding Reaction Mechanisms
1. Upload a reaction question
2. View step-by-step reaction mechanisms with animations
3. Use play/pause controls to step through mechanisms
4. Read detailed explanations for each step

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for API keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Made with ❤️**
