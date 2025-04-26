//
//  ViroSmartReplies.m
//  ViroReact
//
//  Created by ReactVision on 4/26/25.
//  Copyright © 2025 ReactVision. All rights reserved.
//

#import "ViroSmartReplies.h"
#import <React/RCTUtils.h>
#import <MLKitSmartReply/MLKitSmartReply.h>

@implementation ViroSmartReplies {
    MLKSmartReply *smartReply;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        smartReply = [MLKSmartReply smartReply];
    }
    return self;
}

RCT_EXPORT_METHOD(suggestReplies:(NSArray *)conversation
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableArray<MLKTextMessage *> *messages = [NSMutableArray array];
    
    // Convert React Native conversation to ML Kit TextMessage objects
    for (NSDictionary *messageDict in conversation) {
        NSString *text = messageDict[@"text"];
        BOOL isLocalUser = [messageDict[@"isLocalUser"] boolValue];
        
        NSTimeInterval timestamp = [[NSDate date] timeIntervalSince1970] * 1000;
        if (messageDict[@"timestamp"]) {
            timestamp = [messageDict[@"timestamp"] doubleValue];
        }
        
        MLKTextMessage *message;
        if (isLocalUser) {
            message = [MLKTextMessage localUserMessage:text
                                             timestamp:timestamp];
        } else {
            message = [MLKTextMessage remoteUserMessage:text
                                              timestamp:timestamp
                                                 userID:@"remote-user"];
        }
        
        [messages addObject:message];
    }
    
    // Generate smart replies
    [smartReply suggestRepliesForMessages:messages
                               completion:^(MLKSmartReplySuggestionResult * _Nullable result,
                                            NSError * _Nullable error) {
        if (error) {
            reject(@"E_SMART_REPLIES", @"Smart replies generation failed", error);
            return;
        }
        
        NSMutableArray *suggestions = [NSMutableArray array];
        
        for (MLKSmartReplySuggestion *suggestion in result.suggestions) {
            NSDictionary *suggestionDict = @{
                @"text": suggestion.text
            };
            [suggestions addObject:suggestionDict];
        }
        
        resolve(suggestions);
    }];
}

@end