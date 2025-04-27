//
//  ViroSpeechRecognition.m
//  ViroReact
//
//  Created by ReactVision on 4/27/25.
//  Copyright © 2025 ReactVision. All rights reserved.
//

#import "ViroSpeechRecognition.h"
#import <React/RCTUtils.h>
#import <Speech/Speech.h>
#import <AVFoundation/AVFoundation.h>

// Constants for speech recognition states
static NSString * const kStateInactive = @"inactive";
static NSString * const kStateListening = @"listening";
static NSString * const kStateProcessing = @"processing";
static NSString * const kStateStopped = @"stopped";
static NSString * const kStateError = @"error";

// Constants for speech recognition engines
static NSString * const kEngineApple = @"apple";
static NSString * const kEngineGoogle = @"google";
static NSString * const kEngineMLKit = @"mlkit";
static NSString * const kEngineDefault = @"default";

@interface ViroSpeechRecognition () <SFSpeechRecognizerDelegate>

@property (nonatomic, strong) SFSpeechRecognizer *speechRecognizer;
@property (nonatomic, strong) SFSpeechAudioBufferRecognitionRequest *recognitionRequest;
@property (nonatomic, strong) SFSpeechRecognitionTask *recognitionTask;
@property (nonatomic, strong) AVAudioEngine *audioEngine;
@property (nonatomic, strong) NSString *languageCode;
@property (nonatomic, assign) BOOL isListening;
@property (nonatomic, assign) BOOL isContinuous;
@property (nonatomic, assign) BOOL partialResults;
@property (nonatomic, assign) BOOL preferOnDevice;
@property (nonatomic, assign) BOOL filterProfanity;
@property (nonatomic, assign) BOOL stopOnSilence;
@property (nonatomic, assign) NSTimeInterval silenceTimeout;
@property (nonatomic, assign) NSTimeInterval maxDuration;
@property (nonatomic, strong) NSTimer *maxDurationTimer;
@property (nonatomic, strong) NSTimer *silenceTimer;
@property (nonatomic, assign) float lastVolume;
@property (nonatomic, assign) NSTimeInterval lastVolumeUpdate;

@end

@implementation ViroSpeechRecognition

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _languageCode = @"en-US";
        _isListening = NO;
        _isContinuous = NO;
        _partialResults = YES;
        _preferOnDevice = YES;
        _filterProfanity = NO;
        _stopOnSilence = YES;
        _silenceTimeout = 1.5; // 1.5 seconds
        _maxDuration = 10.0; // 10 seconds
        _lastVolume = 0.0;
        _lastVolumeUpdate = 0.0;
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"onSpeechResult",
        @"onSpeechError",
        @"onSpeechStateChange",
        @"onSpeechVolumeChange"
    ];
}

- (NSDictionary *)constantsToExport {
    return @{
        @"STATE_INACTIVE": kStateInactive,
        @"STATE_LISTENING": kStateListening,
        @"STATE_PROCESSING": kStateProcessing,
        @"STATE_STOPPED": kStateStopped,
        @"STATE_ERROR": kStateError,
        @"ENGINE_APPLE": kEngineApple,
        @"ENGINE_GOOGLE": kEngineGoogle,
        @"ENGINE_ML_KIT": kEngineMLKit,
        @"ENGINE_DEFAULT": kEngineDefault
    };
}

RCT_EXPORT_METHOD(setOptions:(NSDictionary *)options) {
    if (options[@"languageCode"]) {
        self.languageCode = options[@"languageCode"];
    }
    
    if (options[@"maxDuration"]) {
        self.maxDuration = [options[@"maxDuration"] doubleValue] / 1000.0; // Convert from ms to seconds
    }
    
    if (options[@"continuous"]) {
        self.isContinuous = [options[@"continuous"] boolValue];
    }
    
    if (options[@"partialResults"]) {
        self.partialResults = [options[@"partialResults"] boolValue];
    }
    
    if (options[@"preferOnDevice"]) {
        self.preferOnDevice = [options[@"preferOnDevice"] boolValue];
    }
    
    if (options[@"filterProfanity"]) {
        self.filterProfanity = [options[@"filterProfanity"] boolValue];
    }
    
    if (options[@"stopOnSilence"]) {
        self.stopOnSilence = [options[@"stopOnSilence"] boolValue];
    }
    
    if (options[@"silenceTimeout"]) {
        self.silenceTimeout = [options[@"silenceTimeout"] doubleValue] / 1000.0; // Convert from ms to seconds
    }
}

RCT_EXPORT_METHOD(start:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (self.isListening) {
        reject(@"already_listening", @"Speech recognition is already running", nil);
        return;
    }
    
    // Update options if provided
    if (options) {
        [self setOptions:options];
    }
    
    // Check authorization status
    [SFSpeechRecognizer requestAuthorization:^(SFSpeechRecognizerAuthorizationStatus status) {
        switch (status) {
            case SFSpeechRecognizerAuthorizationStatusAuthorized:
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self startRecognition:resolve rejecter:reject];
                });
                break;
                
            case SFSpeechRecognizerAuthorizationStatusDenied:
                reject(@"permission_denied", @"User denied speech recognition permission", nil);
                break;
                
            case SFSpeechRecognizerAuthorizationStatusRestricted:
                reject(@"permission_restricted", @"Speech recognition restricted on this device", nil);
                break;
                
            case SFSpeechRecognizerAuthorizationStatusNotDetermined:
                reject(@"permission_not_determined", @"Speech recognition permission not determined", nil);
                break;
        }
    }];
}

- (void)startRecognition:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject {
    // Initialize speech recognizer with the specified language
    NSLocale *locale = [NSLocale localeWithLocaleIdentifier:self.languageCode];
    self.speechRecognizer = [[SFSpeechRecognizer alloc] initWithLocale:locale];
    
    if (!self.speechRecognizer) {
        reject(@"language_not_supported", [NSString stringWithFormat:@"Language %@ is not supported", self.languageCode], nil);
        return;
    }
    
    self.speechRecognizer.delegate = self;
    
    // Check if audio engine is running
    if (self.audioEngine.isRunning) {
        [self.audioEngine stop];
        [self.recognitionRequest endAudio];
    }
    
    // Initialize audio session
    NSError *audioSessionError = nil;
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setCategory:AVAudioSessionCategoryRecord mode:AVAudioSessionModeMeasurement options:AVAudioSessionCategoryOptionDuckOthers error:&audioSessionError];
    
    if (audioSessionError) {
        reject(@"audio_session_error", @"Could not configure audio session", audioSessionError);
        return;
    }
    
    [audioSession setActive:YES withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:&audioSessionError];
    
    if (audioSessionError) {
        reject(@"audio_session_error", @"Could not activate audio session", audioSessionError);
        return;
    }
    
    // Create recognition request
    self.recognitionRequest = [[SFSpeechAudioBufferRecognitionRequest alloc] init];
    self.recognitionRequest.shouldReportPartialResults = self.partialResults;
    
    if (@available(iOS 13.0, *)) {
        if (self.preferOnDevice && [self.speechRecognizer supportsOnDeviceRecognition]) {
            self.recognitionRequest.requiresOnDeviceRecognition = YES;
        }
    }
    
    // Create audio engine if needed
    if (!self.audioEngine) {
        self.audioEngine = [[AVAudioEngine alloc] init];
    }
    
    // Configure audio input
    AVAudioInputNode *inputNode = self.audioEngine.inputNode;
    AVAudioFormat *recordingFormat = [inputNode outputFormatForBus:0];
    
    // Install tap on input node
    [inputNode installTapOnBus:0 bufferSize:1024 format:recordingFormat block:^(AVAudioPCMBuffer * _Nonnull buffer, AVAudioTime * _Nonnull when) {
        [self.recognitionRequest appendAudioPCMBuffer:buffer];
        
        // Calculate audio level for volume updates
        float volume = [self calculateVolumeLevel:buffer];
        NSTimeInterval currentTime = [[NSDate date] timeIntervalSince1970];
        
        // Only send volume updates every 100ms to avoid flooding the JS side
        if (currentTime - self.lastVolumeUpdate >= 0.1) {
            self.lastVolumeUpdate = currentTime;
            [self sendVolumeChangeEvent:volume];
            
            // Reset silence timer if we detect sound
            if (self.stopOnSilence && volume > 0.05) {
                [self resetSilenceTimer];
            }
        }
        
        self.lastVolume = volume;
    }];
    
    // Start recognition task
    NSError *recognitionError = nil;
    __weak typeof(self) weakSelf = self;
    
    self.recognitionTask = [self.speechRecognizer recognitionTaskWithRequest:self.recognitionRequest resultHandler:^(SFSpeechRecognitionResult * _Nullable result, NSError * _Nullable error) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        
        BOOL isFinal = NO;
        
        if (result) {
            isFinal = result.isFinal;
            
            // Send result to JS
            NSString *transcript = result.bestTranscription.formattedString;
            float confidence = 0.0;
            
            // Calculate confidence (average of all segment confidences)
            if (result.bestTranscription.segments.count > 0) {
                float totalConfidence = 0.0;
                for (SFTranscriptionSegment *segment in result.bestTranscription.segments) {
                    totalConfidence += segment.confidence;
                }
                confidence = totalConfidence / result.bestTranscription.segments.count;
            }
            
            NSDictionary *resultDict = @{
                @"text": transcript ?: @"",
                @"isFinal": @(isFinal),
                @"confidence": @(confidence)
            };
            
            // Add alternatives if available
            if (result.transcriptions.count > 1) {
                NSMutableArray *alternatives = [NSMutableArray array];
                
                for (int i = 1; i < result.transcriptions.count; i++) {
                    SFTranscription *transcription = result.transcriptions[i];
                    
                    // Calculate confidence for this alternative
                    float altConfidence = 0.0;
                    if (transcription.segments.count > 0) {
                        float totalConfidence = 0.0;
                        for (SFTranscriptionSegment *segment in transcription.segments) {
                            totalConfidence += segment.confidence;
                        }
                        altConfidence = totalConfidence / transcription.segments.count;
                    }
                    
                    [alternatives addObject:@{
                        @"text": transcription.formattedString ?: @"",
                        @"confidence": @(altConfidence)
                    }];
                }
                
                NSMutableDictionary *mutableResult = [resultDict mutableCopy];
                mutableResult[@"alternatives"] = alternatives;
                resultDict = mutableResult;
            }
            
            [strongSelf sendResultEvent:resultDict];
            
            if (isFinal) {
                [strongSelf sendStateChangeEvent:kStateProcessing];
            }
        }
        
        if (error || isFinal) {
            // Stop audio engine and recognition task
            [strongSelf.audioEngine stop];
            [inputNode removeTapOnBus:0];
            
            strongSelf.recognitionRequest = nil;
            strongSelf.recognitionTask = nil;
            strongSelf.isListening = NO;
            
            // Cancel timers
            [strongSelf.maxDurationTimer invalidate];
            strongSelf.maxDurationTimer = nil;
            
            [strongSelf.silenceTimer invalidate];
            strongSelf.silenceTimer = nil;
            
            if (error) {
                [strongSelf sendErrorEvent:error];
                [strongSelf sendStateChangeEvent:kStateError];
            } else {
                [strongSelf sendStateChangeEvent:kStateInactive];
            }
            
            // Restart listening if continuous mode is enabled and there was no error
            if (strongSelf.isContinuous && !error) {
                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    [strongSelf startRecognition:^(id result) {} rejecter:^(NSString *code, NSString *message, NSError *error) {}];
                });
            }
        }
    }];
    
    if (recognitionError) {
        reject(@"recognition_error", @"Could not start speech recognition", recognitionError);
        return;
    }
    
    // Start audio engine
    NSError *audioEngineError = nil;
    [self.audioEngine prepare];
    [self.audioEngine startAndReturnError:&audioEngineError];
    
    if (audioEngineError) {
        reject(@"audio_engine_error", @"Could not start audio engine", audioEngineError);
        return;
    }
    
    self.isListening = YES;
    [self sendStateChangeEvent:kStateListening];
    
    // Set up max duration timer
    if (self.maxDuration > 0) {
        self.maxDurationTimer = [NSTimer scheduledTimerWithTimeInterval:self.maxDuration
                                                                 target:self
                                                               selector:@selector(maxDurationReached)
                                                               userInfo:nil
                                                                repeats:NO];
    }
    
    // Set up silence detection timer
    if (self.stopOnSilence) {
        [self resetSilenceTimer];
    }
    
    resolve(nil);
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!self.isListening) {
        reject(@"not_listening", @"Speech recognition is not running", nil);
        return;
    }
    
    [self.audioEngine stop];
    [self.recognitionRequest endAudio];
    
    [self.maxDurationTimer invalidate];
    self.maxDurationTimer = nil;
    
    [self.silenceTimer invalidate];
    self.silenceTimer = nil;
    
    self.isListening = NO;
    [self sendStateChangeEvent:kStateStopped];
    
    resolve(nil);
}

RCT_EXPORT_METHOD(cancel:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (self.recognitionTask) {
        [self.recognitionTask cancel];
        self.recognitionTask = nil;
    }
    
    if (self.audioEngine.isRunning) {
        [self.audioEngine stop];
        [self.audioEngine.inputNode removeTapOnBus:0];
    }
    
    [self.maxDurationTimer invalidate];
    self.maxDurationTimer = nil;
    
    [self.silenceTimer invalidate];
    self.silenceTimer = nil;
    
    self.recognitionRequest = nil;
    self.isListening = NO;
    
    [self sendStateChangeEvent:kStateInactive];
    
    resolve(nil);
}

RCT_EXPORT_METHOD(isSupported:(NSString *)engine
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if ([engine isEqualToString:kEngineApple] || [engine isEqualToString:kEngineDefault]) {
        // Check if speech recognition is available on this device
        resolve(@([SFSpeechRecognizer class] != nil));
    } else if ([engine isEqualToString:kEngineMLKit]) {
        // Check if ML Kit is available
        BOOL isMLKitAvailable = NO;
        Class mlKitClass = NSClassFromString(@"MLKSpeechRecognizer");
        if (mlKitClass) {
            isMLKitAvailable = YES;
        }
        resolve(@(isMLKitAvailable));
    } else if ([engine isEqualToString:kEngineGoogle]) {
        // Google's Cloud Speech API is always available through network requests
        resolve(@YES);
    } else {
        resolve(@NO);
    }
}

RCT_EXPORT_METHOD(getAvailableLanguages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSMutableArray *languages = [NSMutableArray array];
    
    // Get all available locales for speech recognition
    NSArray<NSLocale *> *supportedLocales = [SFSpeechRecognizer supportedLocales];
    for (NSLocale *locale in supportedLocales) {
        [languages addObject:[locale localeIdentifier]];
    }
    
    resolve(languages);
}

#pragma mark - SFSpeechRecognizerDelegate

- (void)speechRecognizer:(SFSpeechRecognizer *)speechRecognizer availabilityDidChange:(BOOL)available {
    if (!available && self.isListening) {
        // Speech recognition became unavailable while listening
        [self sendErrorEvent:[NSError errorWithDomain:@"ViroSpeechRecognition" code:100 userInfo:@{NSLocalizedDescriptionKey: @"Speech recognition became unavailable"}]];
        [self sendStateChangeEvent:kStateError];
        
        // Stop listening
        [self.audioEngine stop];
        [self.recognitionRequest endAudio];
        self.isListening = NO;
    }
}

#pragma mark - Helper Methods

- (void)maxDurationReached {
    if (self.isListening) {
        [self.recognitionRequest endAudio];
    }
}

- (void)silenceDetected {
    if (self.isListening && self.stopOnSilence) {
        [self.recognitionRequest endAudio];
    }
}

- (void)resetSilenceTimer {
    [self.silenceTimer invalidate];
    
    self.silenceTimer = [NSTimer scheduledTimerWithTimeInterval:self.silenceTimeout
                                                         target:self
                                                       selector:@selector(silenceDetected)
                                                       userInfo:nil
                                                        repeats:NO];
}

- (float)calculateVolumeLevel:(AVAudioPCMBuffer *)buffer {
    float volume = 0.0;
    float *samples = buffer.floatChannelData[0];
    NSUInteger frameCount = buffer.frameLength;
    
    for (NSUInteger i = 0; i < frameCount; i++) {
        float sample = samples[i];
        volume += sample * sample;
    }
    
    volume = (frameCount > 0) ? sqrtf(volume / frameCount) : 0.0;
    
    // Normalize to 0-1 range (typical audio levels are much lower than 1.0)
    volume = MIN(1.0, volume * 5.0);
    
    return volume;
}

- (void)sendResultEvent:(NSDictionary *)result {
    [self sendEventWithName:@"onSpeechResult" body:result];
}

- (void)sendErrorEvent:(NSError *)error {
    NSString *errorCode;
    
    switch (error.code) {
        case SFSpeechRecognizerAuthorizationStatusDenied:
            errorCode = @"permission_denied";
            break;
        case SFSpeechRecognizerAuthorizationStatusRestricted:
            errorCode = @"permission_restricted";
            break;
        case SFSpeechRecognizerAuthorizationStatusNotDetermined:
            errorCode = @"permission_not_determined";
            break;
        default:
            errorCode = [NSString stringWithFormat:@"error_%ld", (long)error.code];
            break;
    }
    
    NSDictionary *errorDict = @{
        @"code": errorCode,
        @"message": error.localizedDescription ?: @"Unknown error"
    };
    
    [self sendEventWithName:@"onSpeechError" body:errorDict];
}

- (void)sendStateChangeEvent:(NSString *)state {
    [self sendEventWithName:@"onSpeechStateChange" body:state];
}

- (void)sendVolumeChangeEvent:(float)volume {
    [self sendEventWithName:@"onSpeechVolumeChange" body:@(volume)];
}

@end