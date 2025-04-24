/**
 * SwiftAIClient - A client for interacting with AI services like Groq and Cartesia
 * Adapted from https://github.com/ai-ng/swift for React Native
 */

// Message type for chat history
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Configuration for the SwiftAIClient
export interface SwiftAIClientConfig {
  groqApiKey: string;
  cartesiaApiKey: string;
}

// Response from the transcription service
export interface TranscriptionResponse {
  text: string;
}

// Response from the text completion service
export interface CompletionResponse {
  content: string;
}

// Response from the voice synthesis service
export interface VoiceSynthesisResponse {
  audioData: ArrayBuffer;
}

/**
 * SwiftAIClient - A client for interacting with AI services
 */
export class SwiftAIClient {
  private groqApiKey: string;
  private cartesiaApiKey: string;

  constructor(config: SwiftAIClientConfig) {
    this.groqApiKey = config.groqApiKey;
    this.cartesiaApiKey = config.cartesiaApiKey;
  }

  /**
   * Transcribe audio to text using Groq's Whisper API
   * @param audioData - The audio data to transcribe
   * @returns The transcription result
   */
  async transcribeAudio(audioData: Blob): Promise<TranscriptionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', audioData);
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const data = await response.json();
      return { text: data.text.trim() };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  /**
   * Generate a text completion using Groq's LLM API
   * @param messages - The conversation history
   * @param systemPrompt - The system prompt to use
   * @returns The completion result
   */
  async generateCompletion(
    messages: Message[],
    systemPrompt: string
  ): Promise<CompletionResponse> {
    try {
      const allMessages = [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        ...messages,
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: allMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Text completion failed: ${errorText}`);
      }

      const data = await response.json();
      return { content: data.choices[0].message.content };
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  }

  /**
   * Synthesize speech from text using Cartesia's API
   * @param text - The text to synthesize
   * @returns The synthesized audio data
   */
  async synthesizeSpeech(text: string): Promise<VoiceSynthesisResponse> {
    try {
      const response = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'Cartesia-Version': '2024-06-30',
          'Content-Type': 'application/json',
          'X-API-Key': this.cartesiaApiKey,
        },
        body: JSON.stringify({
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: '79a125e8-cd45-4c13-8a67-188112f4dd22',
          },
          output_format: {
            container: 'raw',
            encoding: 'pcm_f32le',
            sample_rate: 24000,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Speech synthesis failed: ${errorText}`);
      }

      const audioData = await response.arrayBuffer();
      return { audioData };
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  /**
   * Process a voice command end-to-end: transcribe, generate completion, and synthesize speech
   * @param audioData - The audio data containing the voice command
   * @param messages - The conversation history
   * @param systemPrompt - The system prompt to use
   * @returns The processed result with transcript, response text, and audio data
   */
  async processVoiceCommand(
    audioData: Blob,
    messages: Message[],
    systemPrompt: string
  ): Promise<{
    transcript: string;
    responseText: string;
    audioData: ArrayBuffer;
  }> {
    // Step 1: Transcribe the audio
    const transcription = await this.transcribeAudio(audioData);
    
    // Step 2: Generate a completion
    const updatedMessages = [
      ...messages,
      { role: 'user' as const, content: transcription.text },
    ];
    const completion = await this.generateCompletion(updatedMessages, systemPrompt);
    
    // Step 3: Synthesize speech
    const voice = await this.synthesizeSpeech(completion.content);
    
    return {
      transcript: transcription.text,
      responseText: completion.content,
      audioData: voice.audioData,
    };
  }
}