# AgentConvo Voice Backend

This project routes voice input from the ElevenLabs Conversational Agent to OpenAI's GPT-4o and returns an audio response using ElevenLabs TTS.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Add your API keys in a `.env` file:

   ```
   OPENAI_API_KEY=your-openai-key
   ELEVENLABS_API_KEY=your-elevenlabs-key
   ELEVENLABS_VOICE_ID=your-voice-id
   ```

3. Run locally or deploy to Vercel. Your endpoint will be:

   ```
   https://<your-vercel-project>.vercel.app/api/webhook
   ```

4. Add this URL as the webhook in ElevenLabs CA configuration.

Enjoy your voice-first AI assistant!
