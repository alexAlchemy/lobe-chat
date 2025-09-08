# ElevenLabs TTS Integration

This document explains how to use ElevenLabs text-to-speech service in Lobe Chat.

## Setup

### 1. Get ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io) and create an account
2. Navigate to your API settings
3. Generate an API key

### 2. Configure in Lobe Chat

You can configure ElevenLabs in two ways:

#### Option A: Environment Variable (Recommended for self-hosted)
Set the environment variable:
```bash
ELEVENLABS_API_KEY=your_api_key_here
```

#### Option B: User Settings (For individual users)
1. Go to Settings → TTS Settings
2. Find the ElevenLabs section
3. Enter your API key
4. Select your preferred model

## Usage

### 1. Enable ElevenLabs for an Agent

1. Open Agent Settings
2. Go to TTS (Text-to-Speech) section
3. Select "ElevenLabs" as the TTS service
4. Choose a voice (or use the default Adam voice)

### 2. Supported Models

- `eleven_multilingual_v2` (Default) - Best for multiple languages
- `eleven_monolingual_v1` - Optimized for English
- `eleven_turbo_v2` - Fastest synthesis

### 3. Voice Configuration

ElevenLabs supports custom voices. You can:

- Use the default voice (Adam - `pNInz6obpgDQGcFmaJgB`)
- Configure custom voice IDs in the agent voice settings
- Visit [ElevenLabs Voice Library](https://elevenlabs.io/voice-library) to find voice IDs

## Technical Details

### API Endpoint
The integration uses ElevenLabs' Text-to-Speech API:
- Endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- Method: POST
- Audio Format: MP3

### Voice Settings
Default voice settings are optimized for natural speech:
- Stability: 0.5
- Similarity Boost: 0.75

### Error Handling
The integration includes proper error handling for:
- Missing API keys
- Invalid voice IDs
- API rate limits
- Network errors

## Troubleshooting

### Common Issues

1. **"ElevenLabs API key is required" error**
   - Ensure your API key is set in environment variables or user settings
   - Check that the API key is valid and has sufficient credits

2. **Audio not playing**
   - Verify the voice ID is correct
   - Check browser console for errors
   - Ensure your ElevenLabs account has available credits

3. **Poor audio quality**
   - Try different models (eleven_turbo_v2 for speed, eleven_multilingual_v2 for quality)
   - Adjust voice settings if using custom configurations

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your ElevenLabs API key and account status
3. Test with different voices and models
4. Ensure your internet connection is stable

## Cost Considerations

ElevenLabs is a paid service with character-based pricing:
- Monitor your usage through the ElevenLabs dashboard
- Consider setting up usage alerts
- Choose appropriate models based on your quality vs. cost needs

For the latest pricing information, visit [ElevenLabs Pricing](https://elevenlabs.io/pricing).