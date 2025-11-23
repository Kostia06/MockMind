# MockMind - AI-Powered Interview Prep Platform

A cutting-edge mock interview application powered by AI that helps you practice and improve your interview skills with real-time voice interaction. Simply paste a job posting, and MockMind creates a personalized interview experience tailored to that specific role.

## Features

- **Job Posting-Based Interviews**: Paste any job posting and get customized interview questions
- **Real-time Voice Interviews**: Conduct natural conversations with an AI interviewer
- **Live Transcription**: See your spoken responses converted to text in real-time
- **Multiple AI Voice Options**: Choose from 4 different interviewer voices (Alloy, Echo, Nova, Shimmer)
- **Adaptive Questions**: AI generates follow-up questions based on your responses and the job requirements
- **Detailed Feedback Analysis**:
  - Overall performance score (1-10)
  - Communication and technical skill breakdown
  - Strength and weakness identification
  - Filler word detection
  - Specific improvement suggestions
- **Interview History**: Persistent local storage tracks all your practice sessions
- **Modern UI**: Clean, minimalist design with advanced animations and interactive elements

## Tech Stack

- **Frontend**: Next.js 14.2.33, React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion for smooth transitions and interactions
- **Backend**: Next.js API Routes
- **AI Services**:
  - OpenAI GPT-4o for interview logic and question generation
  - Whisper API for speech-to-text transcription
  - OpenAI TTS (Text-to-Speech) for realistic voice responses
- **State Management**: React Hooks
- **Storage**: localStorage for persistent interview history

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mockmind
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Get your OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Start an Interview

- On the landing page, paste a job posting in the text area
- The AI will automatically extract:
  - Job role/title
  - Experience level (Entry, Mid, Senior)
  - Key requirements and responsibilities
- Click "Start Mock Interview" to proceed

### 2. Pre-Interview Setup (Waiting Room)

- Test your camera and microphone
- Select your preferred AI interviewer voice:
  - **Alloy**: Balanced and professional
  - **Echo**: Clear and articulate
  - **Nova**: Warm and engaging
  - **Shimmer**: Friendly and approachable
- Review the extracted job details
- Click "Join Interview" when ready

### 3. During the Interview

- The AI interviewer asks questions tailored to the job posting
- Click "Start Recording" to begin answering
- Speak naturally - your audio is transcribed in real-time
- Click "Stop Recording" when finished
- The AI processes your answer and asks a relevant follow-up question
- Interview continues for 5-7 questions

### 4. After Interview Completion

- View detailed performance feedback
- See strengths and areas for improvement
- Review communication patterns and filler word usage
- Get specific suggestions for improvement
- Choose to:
  - View detailed feedback analysis
  - Start a new interview
  - Return to home

### 5. Interview History

- Access your complete interview history from the navigation
- View all past sessions with:
  - Job role and level
  - Date and duration
  - Number of questions answered
  - Performance scores (when available)
- History persists across browser sessions using localStorage

## API Routes

- `POST /api/transcribe`: Converts audio to text using Whisper API
- `POST /api/interview`: Generates interview questions and AI responses using GPT-4o
- `POST /api/feedback`: Analyzes interview performance and generates comprehensive feedback
- `POST /api/analyze-posting`: Extracts job details from posting text
- `POST /api/tts`: Generates speech audio from text using OpenAI TTS

## Project Structure

```
app/
├── layout.tsx              # Root layout with navigation
├── page.tsx                # Landing page with job posting input
├── globals.css             # Global styles and animations
├── zoom-interview/
│   └── page.tsx           # Main interview page with waiting room
├── feedback/
│   └── page.tsx           # Detailed feedback analysis page
├── history/
│   └── page.tsx           # Interview history with localStorage
└── api/
    ├── transcribe/
    │   └── route.ts       # Whisper API integration
    ├── interview/
    │   └── route.ts       # GPT-4o interview logic
    ├── feedback/
    │   └── route.ts       # Feedback generation
    ├── analyze-posting/
    │   └── route.ts       # Job posting analysis
    └── tts/
        └── route.ts       # Text-to-speech generation

components/
├── zoom-waiting-room.tsx   # Pre-interview setup screen
├── zoom-interview-enhanced.tsx  # Main interview interface
└── text-cursor-proximity.tsx   # Interactive text animation component
```

## Key Features Implementation

### Job Posting Analysis
- AI extracts job role, level, and requirements from any job posting
- Generates personalized interview questions based on the posting
- Adapts difficulty and focus areas to match the role

### Real-Time Voice Recording
- Uses Web MediaRecorder API for audio capture
- Sends audio blobs to Whisper API for transcription
- Displays live transcription in the interface

### AI Interview Flow
- GPT-4o processes conversation context and job requirements
- Generates natural, relevant follow-up questions
- Maintains conversation history for coherent dialogue
- Adapts questions based on candidate responses

### Voice Responses
- OpenAI TTS generates natural-sounding speech
- Multiple voice options for personalized experience
- Seamless audio playback in the browser

### Feedback Analysis
- Comprehensive analysis of each answer
- Detects filler words and speech patterns
- Generates actionable improvement suggestions
- Provides detailed skill breakdowns with visual progress indicators

### Modern UI/UX
- Mouse-following gradient effects
- Animated components with Framer Motion
- Grid patterns and noise textures for depth
- Gradient borders and glow effects
- Staggered entrance animations
- Responsive design for all screen sizes

## Browser Support

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14.1+
- Edge 90+

Requires microphone permissions for audio recording.

## Important Notes

- Interview history is stored in browser localStorage (persists across sessions)
- No server-side database - all data stays on your device
- Requires a valid OpenAI API key to function
- OpenAI API usage will incur costs based on usage

## Data Storage

- **localStorage**: Interview history (job role, level, duration, scores)
- **sessionStorage**: Current interview data (temporary)
- **No cloud storage**: All data remains on your local device

## Customization

### Adjusting Interview Length
Modify the question count in `/app/api/interview/route.ts`

### Changing AI Behavior
Edit the system prompts in `/app/api/interview/route.ts` to adjust:
- Interview style and tone
- Question difficulty
- Follow-up behavior

### Adding Voice Options
The app supports any OpenAI TTS voice. Edit voice options in `/components/zoom-waiting-room.tsx`

### UI Customization
- Color scheme: Edit Tailwind classes in component files
- Animations: Modify Framer Motion props
- Layout: Adjust component structures in page files

## Troubleshooting

### Microphone Not Working
- Check browser permissions for microphone access
- Ensure you're using HTTPS (required in production)
- Try a different browser

### API Errors
- Verify your OpenAI API key is correct
- Check API usage limits on OpenAI dashboard
- Ensure sufficient API credits

### Audio Quality Issues
- Test microphone in browser settings
- Speak 6-12 inches from microphone
- Reduce background noise

### History Not Saving
- Check if localStorage is enabled in browser
- Verify browser is not in private/incognito mode
- Clear browser cache if issues persist

## Performance Tips

- Use Chrome or Edge for best compatibility
- Close unnecessary browser tabs
- Maintain stable internet connection
- Test microphone before starting interviews
- Allow popup/audio permissions when prompted

## Future Enhancements

- Database integration for cloud-based history
- Video recording capabilities
- Interview replay with timestamped feedback
- Company-specific interview templates
- Performance analytics dashboard
- Interview scheduling and reminders
- Peer comparison and benchmarking
- Export feedback as PDF reports
- Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## Credits

Built with OpenAI's GPT-4o, Whisper, and TTS APIs. UI inspired by modern design principles from 21st.dev.
