//
//  ViroDigitalInkRecognition.m
//  ViroReact
//
//  Created by ReactVision on 4/26/25.
//  Copyright © 2025 ReactVision. All rights reserved.
//

#import "ViroDigitalInkRecognition.h"
#import <React/RCTUtils.h>
#import <MLKitDigitalInkRecognition/MLKitDigitalInkRecognition.h>
#import <MLKitCommon/MLKitCommon.h>

@implementation ViroDigitalInkRecognition {
    MLKDigitalInkRecognizer *recognizer;
    MLKModelManager *modelManager;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        modelManager = [MLKModelManager modelManager];
    }
    return self;
}

RCT_EXPORT_METHOD(recognize:(NSArray *)strokes
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // Get language code from options
    NSString *languageCode = @"en";
    if (options[@"languageCode"]) {
        languageCode = options[@"languageCode"];
    }
    
    // Get max result count
    NSInteger maxResultCount = 1;
    if (options[@"maxResultCount"]) {
        maxResultCount = [options[@"maxResultCount"] integerValue];
    }
    
    // Check if auto download is enabled
    BOOL autoDownloadModel = YES;
    if (options[@"autoDownloadModel"] != nil) {
        autoDownloadModel = [options[@"autoDownloadModel"] boolValue];
    }
    
    // Get model identifier
    NSError *error;
    MLKDigitalInkRecognitionModelIdentifier *modelIdentifier = 
        [MLKDigitalInkRecognitionModelIdentifier modelIdentifierForLanguageTag:languageCode error:&error];
    
    if (error || !modelIdentifier) {
        reject(@"E_LANGUAGE_NOT_SUPPORTED", [NSString stringWithFormat:@"Language %@ is not supported", languageCode], error);
        return;
    }
    
    // Create the model
    MLKDigitalInkRecognitionModel *model = 
        [MLKDigitalInkRecognitionModel modelWithModelIdentifier:modelIdentifier];
    
    // Check if model is downloaded
    [modelManager isModelDownloaded:model
                        completion:^(BOOL isDownloaded, NSError * _Nullable error) {
        if (error) {
            reject(@"E_MODEL_CHECK", @"Failed to check if model is downloaded", error);
            return;
        }
        
        if (!isDownloaded) {
            if (autoDownloadModel) {
                // Download the model
                MLKModelDownloadConditions *conditions = 
                    [[MLKModelDownloadConditions alloc] initWithAllowsCellularAccess:YES
                                                        allowsBackgroundDownloading:YES];
                
                [self->modelManager downloadModel:model
                                      conditions:conditions
                                      completion:^(NSError * _Nullable error) {
                    if (error) {
                        reject(@"E_MODEL_DOWNLOAD", @"Failed to download model", error);
                        return;
                    }
                    
                    // Model downloaded, proceed with recognition
                    [self performRecognition:strokes model:model maxResultCount:maxResultCount resolver:resolve rejecter:reject];
                }];
            } else {
                reject(@"E_MODEL_NOT_DOWNLOADED", [NSString stringWithFormat:@"Model for %@ is not downloaded", languageCode], nil);
            }
        } else {
            // Model is already downloaded, proceed with recognition
            [self performRecognition:strokes model:model maxResultCount:maxResultCount resolver:resolve rejecter:reject];
        }
    }];
}

- (void)performRecognition:(NSArray *)strokesArray
                     model:(MLKDigitalInkRecognitionModel *)model
             maxResultCount:(NSInteger)maxResultCount
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
{
    // Create recognizer
    MLKDigitalInkRecognizerOptions *options = 
        [[MLKDigitalInkRecognizerOptions alloc] initWithModel:model];
    options.maxResultCount = maxResultCount;
    
    recognizer = [MLKDigitalInkRecognizer digitalInkRecognizerWithOptions:options];
    
    // Convert React Native strokes to ML Kit Ink
    MLKInk *ink = [self inkFromStrokes:strokesArray];
    
    // Perform recognition
    [recognizer recognizeInk:ink
                  completion:^(MLKDigitalInkRecognitionResult * _Nullable result, 
                               NSError * _Nullable error) {
        if (error) {
            reject(@"E_RECOGNITION_FAILED", @"Recognition failed", error);
            return;
        }
        
        NSMutableArray *candidates = [NSMutableArray array];
        
        for (MLKDigitalInkRecognitionCandidate *candidate in result.candidates) {
            NSDictionary *candidateDict = @{
                @"text": candidate.text ?: @"",
                @"score": @(candidate.score)
            };
            [candidates addObject:candidateDict];
        }
        
        resolve(candidates);
    }];
}

- (MLKInk *)inkFromStrokes:(NSArray *)strokesArray {
    MLKInkBuilder *inkBuilder = [[MLKInkBuilder alloc] init];
    
    for (NSDictionary *strokeDict in strokesArray) {
        NSArray *pointsArray = strokeDict[@"points"];
        MLKStrokeBuilder *strokeBuilder = [[MLKStrokeBuilder alloc] init];
        
        for (NSDictionary *pointDict in pointsArray) {
            CGFloat x = [pointDict[@"x"] floatValue];
            CGFloat y = [pointDict[@"y"] floatValue];
            NSTimeInterval t = [pointDict[@"t"] doubleValue];
            
            [strokeBuilder addPointWithX:x y:y t:t];
        }
        
        [inkBuilder addStroke:[strokeBuilder build]];
    }
    
    return [inkBuilder build];
}

RCT_EXPORT_METHOD(isLanguageModelAvailable:(NSString *)languageCode
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error;
    MLKDigitalInkRecognitionModelIdentifier *modelIdentifier = 
        [MLKDigitalInkRecognitionModelIdentifier modelIdentifierForLanguageTag:languageCode error:&error];
    
    if (error || !modelIdentifier) {
        resolve(@NO);
        return;
    }
    
    MLKDigitalInkRecognitionModel *model = 
        [MLKDigitalInkRecognitionModel modelWithModelIdentifier:modelIdentifier];
    
    [modelManager isModelDownloaded:model
                        completion:^(BOOL isDownloaded, NSError * _Nullable error) {
        if (error) {
            reject(@"E_MODEL_CHECK", @"Failed to check if model is downloaded", error);
            return;
        }
        
        resolve(@(isDownloaded));
    }];
}

RCT_EXPORT_METHOD(downloadLanguageModel:(NSString *)languageCode
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error;
    MLKDigitalInkRecognitionModelIdentifier *modelIdentifier = 
        [MLKDigitalInkRecognitionModelIdentifier modelIdentifierForLanguageTag:languageCode error:&error];
    
    if (error || !modelIdentifier) {
        reject(@"E_LANGUAGE_NOT_SUPPORTED", [NSString stringWithFormat:@"Language %@ is not supported", languageCode], error);
        return;
    }
    
    MLKDigitalInkRecognitionModel *model = 
        [MLKDigitalInkRecognitionModel modelWithModelIdentifier:modelIdentifier];
    
    MLKModelDownloadConditions *conditions = 
        [[MLKModelDownloadConditions alloc] initWithAllowsCellularAccess:YES
                                        allowsBackgroundDownloading:YES];
    
    [modelManager downloadModel:model
                    conditions:conditions
                    completion:^(NSError * _Nullable error) {
        if (error) {
            reject(@"E_MODEL_DOWNLOAD", @"Failed to download model", error);
            return;
        }
        
        resolve(nil);
    }];
}

RCT_EXPORT_METHOD(deleteLanguageModel:(NSString *)languageCode
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error;
    MLKDigitalInkRecognitionModelIdentifier *modelIdentifier = 
        [MLKDigitalInkRecognitionModelIdentifier modelIdentifierForLanguageTag:languageCode error:&error];
    
    if (error || !modelIdentifier) {
        reject(@"E_LANGUAGE_NOT_SUPPORTED", [NSString stringWithFormat:@"Language %@ is not supported", languageCode], error);
        return;
    }
    
    MLKDigitalInkRecognitionModel *model = 
        [MLKDigitalInkRecognitionModel modelWithModelIdentifier:modelIdentifier];
    
    [modelManager deleteDownloadedModel:model
                            completion:^(NSError * _Nullable error) {
        if (error) {
            reject(@"E_MODEL_DELETE", @"Failed to delete model", error);
            return;
        }
        
        resolve(nil);
    }];
}

RCT_EXPORT_METHOD(getAvailableLanguages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error;
    NSArray<MLKDigitalInkRecognitionModelIdentifier *> *modelIdentifiers = 
        [MLKDigitalInkRecognitionModelIdentifier allModelIdentifiers:&error];
    
    if (error) {
        reject(@"E_AVAILABLE_LANGUAGES", @"Error getting available languages", error);
        return;
    }
    
    NSMutableArray *languageTags = [NSMutableArray array];
    for (MLKDigitalInkRecognitionModelIdentifier *identifier in modelIdentifiers) {
        if (identifier.languageTag) {
            [languageTags addObject:identifier.languageTag];
        }
    }
    
    resolve(languageTags);
}

@end