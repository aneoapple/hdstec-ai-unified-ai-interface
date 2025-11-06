# HDSTEC AI - Unified AI Interface

A clean, professional interface for interacting with multiple AI providers (OpenAI, Gemini, and optionally Grok, Anthropic, DeepSeek).

## Features

- **Clean Home Interface**: Minimal design with composer in footer
- **Multiple AI Providers**: OpenAI, Google Gemini, with optional support for Grok, Anthropic, and DeepSeek
- **Chat History**: Automatic conversation tracking with preview
- **Custom Agents**: Create specialized AI agents with custom system prompts
- **Voice Input**: Web Speech API integration (no token cost)
- **Drag & Drop**: Reorderable agent list with localStorage persistence
- **Admin Controls**: Upload custom logo and agent icons, rename/delete agents
- **Responsive Design**: Glassmorphism effects with brand colors

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   ```
   VITE_OPENAI_API_KEY=your_key_here
   VITE_GOOGLE_GENAI_API_KEY=your_key_here
   ```

3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

## Usage

### Default Behavior
- Opens with OpenAI GPT-4o conversation automatically
- Clean home with no center content
- Composer fixed in footer

### Voice Input
- Click microphone button to start recording (Chrome/Edge/Safari)
- Speaks in real-time to input field
- Press ESC to stop recording
- No API tokens used (browser-based)

### Agents
- Click agent to start conversation with their system prompt
- Admin can rename, delete, and change icons
- Drag & drop to reorder (saved to localStorage)

### Keyboard Shortcuts
- **ESC**: Close menus/popovers, stop recording
- **Enter**: Send message
- **Shift+Enter**: New line in message

## Admin Features

- Upload custom logo (replaces default "hdstec" text)
- Upload agent icons (PNG/SVG)
- Rename agents
- Delete agents
- Reorder agents (drag & drop)

## Architecture

- **React 18** with TypeScript
- **Zustand** for state management
- **Vite** for build tooling
- **Web Speech API** for voice input
- **localStorage** for persistence

## Browser Support

- Chrome/Edge: Full support including voice
- Safari: Full support including voice
- Firefox: All features except voice input

## License

MIT
