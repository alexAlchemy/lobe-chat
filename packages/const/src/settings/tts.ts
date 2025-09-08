import { UserTTSConfig } from '@lobechat/types';

export const DEFAULT_TTS_CONFIG: UserTTSConfig = {
  elevenlabs: {
    model: 'eleven_multilingual_v2',
  },
  openAI: {
    sttModel: 'whisper-1',
    ttsModel: 'tts-1',
  },
  sttAutoStop: true,
  sttServer: 'openai',
};
