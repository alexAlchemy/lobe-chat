import { POST } from '../route';

// Mock the fetch function
global.fetch = jest.fn();

describe('/webapi/tts/elevenlabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.ELEVENLABS_API_KEY;
  });

  describe('POST', () => {
    it('should return 400 when no API key is provided', async () => {
      const mockRequest = new Request('http://localhost/webapi/tts/elevenlabs', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Hello world',
        }),
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(400);
      
      const text = await response.text();
      expect(text).toBe('ElevenLabs API key is required');
    });

    it('should use API key from environment variable', async () => {
      process.env.ELEVENLABS_API_KEY = 'test-api-key';
      
      const mockAudioBuffer = new ArrayBuffer(100);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer),
      });

      const mockRequest = new Request('http://localhost/webapi/tts/elevenlabs', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Hello world',
        }),
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('audio/mpeg');
      
      // Verify the ElevenLabs API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'xi-api-key': 'test-api-key',
          }),
          body: JSON.stringify({
            text: 'Hello world',
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }),
      );
    });

    it('should use API key from request header', async () => {
      const mockAudioBuffer = new ArrayBuffer(100);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer),
      });

      const mockRequest = new Request('http://localhost/webapi/tts/elevenlabs', {
        method: 'POST',
        headers: {
          'X-elevenlabs-api-key': 'header-api-key',
        },
        body: JSON.stringify({
          input: 'Hello world',
          voice: 'custom-voice-id',
          model: 'eleven_turbo_v2',
        }),
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(200);
      
      // Verify the request used the header API key and custom parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/custom-voice-id',
        expect.objectContaining({
          headers: expect.objectContaining({
            'xi-api-key': 'header-api-key',
          }),
          body: JSON.stringify({
            text: 'Hello world',
            model_id: 'eleven_turbo_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }),
      );
    });

    it('should handle ElevenLabs API errors', async () => {
      process.env.ELEVENLABS_API_KEY = 'test-api-key';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      const mockRequest = new Request('http://localhost/webapi/tts/elevenlabs', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Hello world',
        }),
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(401);
      
      const text = await response.text();
      expect(text).toBe('ElevenLabs API error: Unauthorized');
    });

    it('should handle network errors', async () => {
      process.env.ELEVENLABS_API_KEY = 'test-api-key';
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const mockRequest = new Request('http://localhost/webapi/tts/elevenlabs', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Hello world',
        }),
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(500);
      
      const text = await response.text();
      expect(text).toBe('Internal server error');
    });
  });
});