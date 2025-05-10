import SwiftAI from './SwiftAI';
import { SwiftAIClient } from './SwiftAIClient';
import { AudioPlayer } from './AudioPlayer';
import { VoiceRecognition } from './VoiceRecognition';

export { SwiftAI, SwiftAIClient, AudioPlayer, VoiceRecognition };

export type {
  Message,
  SwiftAIClientConfig,
  TranscriptionResponse,
  CompletionResponse,
  VoiceSynthesisResponse,
} from './SwiftAIClient';

export type { AudioPlayerOptions } from './AudioPlayer';
export type { VoiceRecognitionOptions } from './VoiceRecognition';
export type { SwiftAIProps } from './SwiftAI';

export default SwiftAI;