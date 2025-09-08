import { ELEVENLABS_API_KEY_HEADER_KEY } from '@/const/fetch';

export const runtime = 'edge';

export const preferredRegion = [
  'arn1',
  'bom1',
  'cdg1',
  'cle1',
  'cpt1',
  'dub1',
  'fra1',
  'gru1',
  'hnd1',
  'iad1',
  'icn1',
  'kix1',
  'lhr1',
  'pdx1',
  'sfo1',
  'sin1',
  'syd1',
];

interface ElevenLabsTTSPayload {
  input: string;
  model?: string;
  voice?: string;
  voice_settings?: {
    similarity_boost?: number;
    stability?: number;
  };
}

export const POST = async (req: Request) => {
  const payload = (await req.json()) as ElevenLabsTTSPayload;
  
  // Get API key from headers (preferred) or environment
  const apiKey = req.headers.get(ELEVENLABS_API_KEY_HEADER_KEY) || process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return new Response('ElevenLabs API key is required', { status: 400 });
  }

  const voiceId = payload.voice || 'pNInz6obpgDQGcFmaJgB'; // Default voice ID (Adam)
  const model = payload.model || 'eleven_multilingual_v2';
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: payload.input,
          model_id: model,
          voice_settings: payload.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return new Response(`ElevenLabs API error: ${error}`, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};