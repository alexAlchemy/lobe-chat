import {
  EdgeSpeechOptions,
  MicrosoftSpeechOptions,
  OpenAITTSOptions,
  TTSOptions,
  useEdgeSpeech,
  useMicrosoftSpeech,
  useOpenAITTS,
} from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';
import { useCallback, useRef, useState } from 'react';

import { createHeaderWithElevenLabs, createHeaderWithOpenAI } from '@/services/_header';
import { API_ENDPOINTS } from '@/services/_url';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { TTSServer } from '@/types/agent';

interface TTSConfig extends TTSOptions {
  onUpload?: (currentVoice: string, arraybuffers: ArrayBuffer[]) => void;
  server?: TTSServer;
  voice?: string;
}

interface ElevenLabsOptions {
  api: {
    serviceUrl: string;
  };
  options: {
    voice?: string;
    model?: string;
  };
  onFinish?: (arrayBuffers: ArrayBuffer[]) => void;
}

const useElevenLabsTTS = (content: string, options: ElevenLabsOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | undefined>();
  const abortController = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (!content || isLoading) return;

    setIsLoading(true);
    setAudioSrc(undefined);

    // Cancel any existing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      const response = await fetch(options.api.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createHeaderWithElevenLabs(),
        },
        body: JSON.stringify({
          input: content,
          voice: options.options.voice,
          model: options.options.model,
        }),
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      setAudioSrc(url);
      
      // Call onFinish callback if provided
      if (options.onFinish) {
        options.onFinish([arrayBuffer]);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('ElevenLabs TTS error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [content, options.api.serviceUrl, options.options.voice, options.options.model, options.onFinish, isLoading]);

  const stop = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setIsLoading(false);
  }, []);

  return {
    generate,
    stop,
    isLoading,
    audioSrc,
  };
};

export const useTTS = (content: string, config?: TTSConfig) => {
  const ttsSettings = useUserStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useAgentStore(agentSelectors.currentAgentTTS, isEqual);
  const lang = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const voice = useAgentStore(agentSelectors.currentAgentTTSVoice(lang));
  let useSelectedTTS;
  let options: any = {};
  switch (config?.server || ttsAgentSettings.ttsService) {
    case 'openai': {
      useSelectedTTS = useOpenAITTS;
      options = {
        api: {
          headers: createHeaderWithOpenAI(),
          serviceUrl: API_ENDPOINTS.tts,
        },
        options: {
          model: ttsSettings.openAI.ttsModel,
          voice: config?.voice || voice,
        },
      } as OpenAITTSOptions;
      break;
    }
    case 'edge': {
      useSelectedTTS = useEdgeSpeech;
      options = {
        api: {
          /**
           * @description client fetch
           * serviceUrl: TTS_URL.edge,
           */
        },
        options: {
          voice: config?.voice || voice,
        },
      } as EdgeSpeechOptions;
      break;
    }
    case 'microsoft': {
      useSelectedTTS = useMicrosoftSpeech;
      options = {
        api: {
          serviceUrl: API_ENDPOINTS.microsoft,
        },
        options: {
          voice: config?.voice || voice,
        },
      } as MicrosoftSpeechOptions;
      break;
    }
    case 'elevenlabs': {
      // For ElevenLabs, we'll use a custom hook that mimics the TTS interface
      useSelectedTTS = useElevenLabsTTS;
      options = {
        api: {
          serviceUrl: API_ENDPOINTS.elevenlabs,
        },
        options: {
          voice: config?.voice || voice,
          model: ttsSettings.elevenlabs?.model || 'eleven_multilingual_v2',
        },
      };
      break;
    }
  }

  return useSelectedTTS(content, {
    ...config,
    ...options,
    onFinish: (arraybuffers) => {
      config?.onUpload?.(options.voice || 'alloy', arraybuffers);
    },
  });
};
