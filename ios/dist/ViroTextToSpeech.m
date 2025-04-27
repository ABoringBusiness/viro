//
//  ViroTextToSpeech.m
//  ViroReact
//
//  Created by ReactVision on 4/27/25.
//  Copyright © 2025 ReactVision. All rights reserved.
//

#import "ViroTextToSpeech.h"
#import <React/RCTUtils.h>
#import <AVFoundation/AVFoundation.h>

// Constants for text-to-speech states
static NSString * const kStateIdle = @"idle";
static NSString * const kStateSpeaking = @"speaking";
static NSString * const kStatePaused = @"paused";
static NSString * const kStateStopped = @"stopped";
static NSString * const kStateError = @"error";

// Constants for text-to-speech engines
static NSString * const kEngineApple = @"apple";
static NSString * const kEngineGoogle = @"google";
static NSString * const kEngineDefault = @"default";

// Constants for text-to-speech voice genders
static NSString * const kGenderMale = @"male";
static NSString * const kGenderFemale = @"female";
static NSString * const kGenderNeutral = @"neutral";

@interface ViroTextToSpeech ()

@property (nonatomic, strong) AVSpeechSynthesizer *speechSynthesizer;
@property (nonatomic, strong) NSString *languageCode;
@property (nonatomic, strong) NSString *voiceId;
@property (nonatomic, strong) NSString *voiceGender;
@property (nonatomic, assign) float rate;
@property (nonatomic, assign) float pitch;
@property (nonatomic, assign) float volume;
@property (nonatomic, assign) BOOL preferOnDevice;
@property (nonatomic, assign) BOOL useSsml;
@property (nonatomic, assign) BOOL audioDucking;
@property (nonatomic, assign) BOOL queueUtterances;
@property (nonatomic, strong) NSString *currentUtteranceId;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSString *> *utteranceTextMap;
@property (nonatomic, strong) AVAudioSession *audioSession;
@property (nonatomic, assign) BOOL didActivateAudioSession;

@end

@implementation ViroTextToSpeech

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _speechSynthesizer = [[AVSpeechSynthesizer alloc] init];
        _speechSynthesizer.delegate = self;
        _languageCode = @"en-US";
        _voiceGender = kGenderFemale;
        _rate = 0.5; // AVSpeechUtteranceDefaultSpeechRate is 0.5
        _pitch = 1.0;
        _volume = 1.0;
        _preferOnDevice = YES;
        _useSsml = NO;
        _audioDucking = YES;
        _queueUtterances = NO;
        _utteranceTextMap = [NSMutableDictionary dictionary];
        _audioSession = [AVAudioSession sharedInstance];
        _didActivateAudioSession = NO;
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"onTtsStateChange",
        @"onTtsStart",
        @"onTtsEnd",
        @"onTtsError",
        @"onTtsMarker",
        @"onTtsRange"
    ];
}

- (NSDictionary *)constantsToExport {
    return @{
        @"STATE_IDLE": kStateIdle,
        @"STATE_SPEAKING": kStateSpeaking,
        @"STATE_PAUSED": kStatePaused,
        @"STATE_STOPPED": kStateStopped,
        @"STATE_ERROR": kStateError,
        @"ENGINE_APPLE": kEngineApple,
        @"ENGINE_GOOGLE": kEngineGoogle,
        @"ENGINE_DEFAULT": kEngineDefault,
        @"GENDER_MALE": kGenderMale,
        @"GENDER_FEMALE": kGenderFemale,
        @"GENDER_NEUTRAL": kGenderNeutral
    };
}

RCT_EXPORT_METHOD(setOptions:(NSDictionary *)options) {
    if (options[@"languageCode"]) {
        self.languageCode = options[@"languageCode"];
    }
    
    if (options[@"voiceId"]) {
        self.voiceId = options[@"voiceId"];
    }
    
    if (options[@"voiceGender"]) {
        self.voiceGender = options[@"voiceGender"];
    }
    
    if (options[@"rate"]) {
        self.rate = [options[@"rate"] floatValue];
    }
    
    if (options[@"pitch"]) {
        self.pitch = [options[@"pitch"] floatValue];
    }
    
    if (options[@"volume"]) {
        self.volume = [options[@"volume"] floatValue];
    }
    
    if (options[@"preferOnDevice"]) {
        self.preferOnDevice = [options[@"preferOnDevice"] boolValue];
    }
    
    if (options[@"useSsml"]) {
        self.useSsml = [options[@"useSsml"] boolValue];
    }
    
    if (options[@"audioDucking"]) {
        self.audioDucking = [options[@"audioDucking"] boolValue];
    }
    
    if (options[@"queueUtterances"]) {
        self.queueUtterances = [options[@"queueUtterances"] boolValue];
    }
}

RCT_EXPORT_METHOD(speak:(NSString *)text
                  utteranceId:(NSString *)utteranceId
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Apply utterance-specific options if provided
    if (options) {
        [self applyUtteranceOptions:options];
    }
    
    // Create utterance
    AVSpeechUtterance *utterance = [[AVSpeechUtterance alloc] initWithString:text];
    
    // Set voice
    AVSpeechSynthesisVoice *voice = [self getVoice];
    if (voice) {
        utterance.voice = voice;
    }
    
    // Set speech parameters
    utterance.rate = self.rate;
    utterance.pitchMultiplier = self.pitch;
    utterance.volume = self.volume;
    
    // Store the text for later use in events
    self.utteranceTextMap[utteranceId] = text;
    
    // Set up audio session
    [self setupAudioSession];
    
    // Speak
    @try {
        self.currentUtteranceId = utteranceId;
        
        if (self.queueUtterances) {
            [self.speechSynthesizer speakUtterance:utterance];
        } else {
            [self.speechSynthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
            [self.speechSynthesizer speakUtterance:utterance];
        }
        
        [self sendStateChangeEvent:kStateSpeaking];
        resolve(utteranceId);
    } @catch (NSException *exception) {
        reject(@"speak_error", [NSString stringWithFormat:@"Error speaking text: %@", exception.reason], nil);
    }
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        BOOL stopped = [self.speechSynthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
        if (stopped) {
            self.currentUtteranceId = nil;
            [self teardownAudioSession];
            [self sendStateChangeEvent:kStateStopped];
            resolve(nil);
        } else {
            reject(@"stop_error", @"Failed to stop speech", nil);
        }
    } @catch (NSException *exception) {
        reject(@"stop_error", [NSString stringWithFormat:@"Error stopping speech: %@", exception.reason], nil);
    }
}

RCT_EXPORT_METHOD(pause:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        BOOL paused = [self.speechSynthesizer pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate];
        if (paused) {
            [self sendStateChangeEvent:kStatePaused];
            resolve(nil);
        } else {
            reject(@"pause_error", @"Failed to pause speech", nil);
        }
    } @catch (NSException *exception) {
        reject(@"pause_error", [NSString stringWithFormat:@"Error pausing speech: %@", exception.reason], nil);
    }
}

RCT_EXPORT_METHOD(resume:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        BOOL resumed = [self.speechSynthesizer continueSpeaking];
        if (resumed) {
            [self sendStateChangeEvent:kStateSpeaking];
            resolve(nil);
        } else {
            reject(@"resume_error", @"Failed to resume speech", nil);
        }
    } @catch (NSException *exception) {
        reject(@"resume_error", [NSString stringWithFormat:@"Error resuming speech: %@", exception.reason], nil);
    }
}

RCT_EXPORT_METHOD(getVoices:(NSString *)languageCode
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSMutableArray *voices = [NSMutableArray array];
    
    for (AVSpeechSynthesisVoice *voice in [AVSpeechSynthesisVoice speechVoices]) {
        NSString *voiceLanguage = voice.language;
        
        // Filter by language code if provided
        if (languageCode && ![voiceLanguage hasPrefix:languageCode]) {
            continue;
        }
        
        NSMutableDictionary *voiceDict = [NSMutableDictionary dictionary];
        voiceDict[@"id"] = voice.identifier;
        voiceDict[@"name"] = voice.name;
        voiceDict[@"languageCode"] = voice.language;
        
        // Determine gender based on voice name (this is a heuristic)
        NSString *gender = kGenderNeutral;
        NSString *lowerName = [voice.name lowercaseString];
        if ([lowerName containsString:@"female"] || [lowerName containsString:@"woman"] || [lowerName containsString:@"girl"]) {
            gender = kGenderFemale;
        } else if ([lowerName containsString:@"male"] || [lowerName containsString:@"man"] || [lowerName containsString:@"boy"]) {
            gender = kGenderMale;
        }
        voiceDict[@"gender"] = gender;
        
        if (@available(iOS 9.0, *)) {
            voiceDict[@"isOfflineAvailable"] = @(voice.quality == AVSpeechSynthesisVoiceQualityEnhanced);
        } else {
            voiceDict[@"isOfflineAvailable"] = @NO;
        }
        
        if (@available(iOS 13.0, *)) {
            voiceDict[@"isNeural"] = @(voice.quality == AVSpeechSynthesisVoiceQualityPremium);
        } else {
            voiceDict[@"isNeural"] = @NO;
        }
        
        [voices addObject:voiceDict];
    }
    
    resolve(voices);
}

RCT_EXPORT_METHOD(isSupported:(NSString *)engine
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if ([engine isEqualToString:kEngineApple] || [engine isEqualToString:kEngineDefault]) {
        resolve(@YES);
    } else if ([engine isEqualToString:kEngineGoogle]) {
        // Google's Cloud TTS API is always available through network requests
        resolve(@YES);
    } else {
        resolve(@NO);
    }
}

RCT_EXPORT_METHOD(synthesizeToFile:(NSString *)text
                  filePath:(NSString *)filePath
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Apply options if provided
    if (options) {
        [self applyUtteranceOptions:options];
    }
    
    // Create utterance
    AVSpeechUtterance *utterance = [[AVSpeechUtterance alloc] initWithString:text];
    
    // Set voice
    AVSpeechSynthesisVoice *voice = [self getVoice];
    if (voice) {
        utterance.voice = voice;
    }
    
    // Set speech parameters
    utterance.rate = self.rate;
    utterance.pitchMultiplier = self.pitch;
    utterance.volume = self.volume;
    
    // Check if AVSpeechSynthesizer supports writing to file
    if (@available(iOS 13.0, *)) {
        NSError *error = nil;
        NSURL *fileURL = [NSURL fileURLWithPath:filePath];
        
        // Ensure directory exists
        NSString *directory = [filePath stringByDeletingLastPathComponent];
        [[NSFileManager defaultManager] createDirectoryAtPath:directory
                                  withIntermediateDirectories:YES
                                                   attributes:nil
                                                        error:&error];
        
        if (error) {
            reject(@"synthesis_error", [NSString stringWithFormat:@"Error creating directory: %@", error.localizedDescription], error);
            return;
        }
        
        // Synthesize to file
        [self.speechSynthesizer writeUtterance:utterance toBufferCallback:^(AVAudioBuffer * _Nonnull buffer) {
            // Convert buffer to audio file
            if ([buffer isKindOfClass:[AVAudioPCMBuffer class]]) {
                AVAudioPCMBuffer *pcmBuffer = (AVAudioPCMBuffer *)buffer;
                AVAudioFormat *format = pcmBuffer.format;
                
                // Create audio file
                AVAudioFile *audioFile = nil;
                NSError *fileError = nil;
                
                if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
                    audioFile = [[AVAudioFile alloc] initForWriting:fileURL
                                                           settings:format.settings
                                                              error:&fileError];
                } else {
                    audioFile = [[AVAudioFile alloc] initForWriting:fileURL
                                                           settings:format.settings
                                                     commonFormat:format.commonFormat
                                                      interleaved:format.isInterleaved
                                                            error:&fileError];
                }
                
                if (fileError) {
                    reject(@"synthesis_error", [NSString stringWithFormat:@"Error creating audio file: %@", fileError.localizedDescription], fileError);
                    return;
                }
                
                // Write buffer to file
                NSError *writeError = nil;
                [audioFile writeFromBuffer:pcmBuffer error:&writeError];
                
                if (writeError) {
                    reject(@"synthesis_error", [NSString stringWithFormat:@"Error writing to audio file: %@", writeError.localizedDescription], writeError);
                    return;
                }
                
                resolve(filePath);
            } else {
                reject(@"synthesis_error", @"Unexpected audio buffer type", nil);
            }
        }];
    } else {
        reject(@"synthesis_error", @"Synthesizing to file requires iOS 13.0 or later", nil);
    }
}

#pragma mark - AVSpeechSynthesizerDelegate

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didStartSpeechUtterance:(AVSpeechUtterance *)utterance {
    [self sendStateChangeEvent:kStateSpeaking];
    
    NSString *text = self.utteranceTextMap[self.currentUtteranceId] ?: @"";
    
    NSDictionary *params = @{
        @"id": self.currentUtteranceId ?: @"",
        @"text": text
    };
    
    [self sendEventWithName:@"onTtsStart" body:params];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance {
    NSString *text = self.utteranceTextMap[self.currentUtteranceId] ?: @"";
    
    NSDictionary *params = @{
        @"id": self.currentUtteranceId ?: @"",
        @"text": text
    };
    
    [self.utteranceTextMap removeObjectForKey:self.currentUtteranceId];
    self.currentUtteranceId = nil;
    
    [self teardownAudioSession];
    [self sendStateChangeEvent:kStateIdle];
    [self sendEventWithName:@"onTtsEnd" body:params];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didPauseSpeechUtterance:(AVSpeechUtterance *)utterance {
    [self sendStateChangeEvent:kStatePaused];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didContinueSpeechUtterance:(AVSpeechUtterance *)utterance {
    [self sendStateChangeEvent:kStateSpeaking];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didCancelSpeechUtterance:(AVSpeechUtterance *)utterance {
    [self teardownAudioSession];
    [self sendStateChangeEvent:kStateStopped];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer willSpeakRangeOfSpeechString:(NSRange)characterRange utterance:(AVSpeechUtterance *)utterance {
    NSDictionary *params = @{
        @"utteranceId": self.currentUtteranceId ?: @"",
        @"start": @(characterRange.location),
        @"end": @(characterRange.location + characterRange.length)
    };
    
    [self sendEventWithName:@"onTtsRange" body:params];
}

#pragma mark - Helper Methods

- (AVSpeechSynthesisVoice *)getVoice {
    // If voice ID is specified, use it
    if (self.voiceId) {
        return [AVSpeechSynthesisVoice voiceWithIdentifier:self.voiceId];
    }
    
    // Otherwise, find a voice matching the language and gender
    NSArray<AVSpeechSynthesisVoice *> *voices = [AVSpeechSynthesisVoice speechVoices];
    NSMutableArray<AVSpeechSynthesisVoice *> *matchingVoices = [NSMutableArray array];
    
    // First, filter by language
    for (AVSpeechSynthesisVoice *voice in voices) {
        if ([voice.language hasPrefix:self.languageCode]) {
            [matchingVoices addObject:voice];
        }
    }
    
    // If no voices match the language, use the default voice
    if (matchingVoices.count == 0) {
        return [AVSpeechSynthesisVoice voiceWithLanguage:self.languageCode];
    }
    
    // If gender is specified, filter by gender
    if (self.voiceGender) {
        NSMutableArray<AVSpeechSynthesisVoice *> *genderMatchingVoices = [NSMutableArray array];
        
        for (AVSpeechSynthesisVoice *voice in matchingVoices) {
            NSString *lowerName = [voice.name lowercaseString];
            
            if ([self.voiceGender isEqualToString:kGenderFemale] &&
                ([lowerName containsString:@"female"] || [lowerName containsString:@"woman"] || [lowerName containsString:@"girl"])) {
                [genderMatchingVoices addObject:voice];
            } else if ([self.voiceGender isEqualToString:kGenderMale] &&
                       ([lowerName containsString:@"male"] || [lowerName containsString:@"man"] || [lowerName containsString:@"boy"])) {
                [genderMatchingVoices addObject:voice];
            } else if ([self.voiceGender isEqualToString:kGenderNeutral] &&
                       ![lowerName containsString:@"female"] && ![lowerName containsString:@"woman"] && ![lowerName containsString:@"girl"] &&
                       ![lowerName containsString:@"male"] && ![lowerName containsString:@"man"] && ![lowerName containsString:@"boy"]) {
                [genderMatchingVoices addObject:voice];
            }
        }
        
        // If we found voices matching both language and gender, use the first one
        if (genderMatchingVoices.count > 0) {
            return genderMatchingVoices[0];
        }
    }
    
    // If we get here, we have voices matching the language but not the gender, so use the first one
    return matchingVoices[0];
}

- (void)applyUtteranceOptions:(NSDictionary *)options {
    if (options[@"languageCode"]) {
        self.languageCode = options[@"languageCode"];
    }
    
    if (options[@"voiceId"]) {
        self.voiceId = options[@"voiceId"];
    }
    
    if (options[@"voiceGender"]) {
        self.voiceGender = options[@"voiceGender"];
    }
    
    if (options[@"rate"]) {
        self.rate = [options[@"rate"] floatValue];
    }
    
    if (options[@"pitch"]) {
        self.pitch = [options[@"pitch"] floatValue];
    }
    
    if (options[@"volume"]) {
        self.volume = [options[@"volume"] floatValue];
    }
    
    if (options[@"useSsml"]) {
        self.useSsml = [options[@"useSsml"] boolValue];
    }
    
    if (options[@"audioDucking"]) {
        self.audioDucking = [options[@"audioDucking"] boolValue];
    }
}

- (void)setupAudioSession {
    if (!self.audioDucking) {
        return;
    }
    
    NSError *error = nil;
    
    // Configure audio session
    [self.audioSession setCategory:AVAudioSessionCategoryPlayback
                       withOptions:AVAudioSessionCategoryOptionDuckOthers
                             error:&error];
    
    if (error) {
        NSLog(@"Error setting audio session category: %@", error);
        return;
    }
    
    // Activate audio session
    [self.audioSession setActive:YES error:&error];
    
    if (error) {
        NSLog(@"Error activating audio session: %@", error);
        return;
    }
    
    self.didActivateAudioSession = YES;
}

- (void)teardownAudioSession {
    if (!self.audioDucking || !self.didActivateAudioSession) {
        return;
    }
    
    NSError *error = nil;
    [self.audioSession setActive:NO error:&error];
    
    if (error) {
        NSLog(@"Error deactivating audio session: %@", error);
    }
    
    self.didActivateAudioSession = NO;
}

- (void)sendStateChangeEvent:(NSString *)state {
    [self sendEventWithName:@"onTtsStateChange" body:state];
}

@end