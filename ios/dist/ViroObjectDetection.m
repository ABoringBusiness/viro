//
//  ViroObjectDetection.m
//  ViroReact
//
//  Created by ReactVision on 4/26/25.
//  Copyright © 2025 ReactVision. All rights reserved.
//

#import "ViroObjectDetection.h"
#import <React/RCTUtils.h>
#import <MLKitObjectDetection/MLKitObjectDetection.h>
#import <MLKitObjectDetectionCommon/MLKitObjectDetectionCommon.h>
#import <MLKitVision/MLKitVision.h>

@implementation ViroObjectDetection

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(detect:(NSString *)imageURL
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSURL *url = [NSURL URLWithString:imageURL];
    NSData *imageData;
    
    if ([url.scheme isEqualToString:@"file"]) {
        imageData = [NSData dataWithContentsOfURL:url];
    } else {
        imageData = [NSData dataWithContentsOfURL:url];
    }
    
    if (!imageData) {
        reject(@"E_INPUT_IMAGE", @"Could not create input image from URL", nil);
        return;
    }
    
    UIImage *image = [UIImage imageWithData:imageData];
    if (!image) {
        reject(@"E_INPUT_IMAGE", @"Could not create UIImage from data", nil);
        return;
    }
    
    MLKVisionImage *visionImage = [[MLKVisionImage alloc] initWithImage:image];
    visionImage.orientation = image.imageOrientation;
    
    // Configure the object detector options
    MLKObjectDetectorOptions *detectorOptions = [[MLKObjectDetectorOptions alloc] init];
    
    // Set performance mode
    NSString *performanceMode = options[@"performanceMode"];
    if ([performanceMode isEqualToString:@"accurate"]) {
        detectorOptions.detectorMode = MLKObjectDetectorModeAccurate;
    } else {
        detectorOptions.detectorMode = MLKObjectDetectorModeSingleImage;
    }
    
    // Set multiple objects detection
    NSNumber *multipleObjects = options[@"multipleObjects"];
    if (multipleObjects != nil) {
        detectorOptions.shouldEnableMultipleObjects = [multipleObjects boolValue];
    } else {
        detectorOptions.shouldEnableMultipleObjects = YES;
    }
    
    // Set classification threshold
    NSNumber *classificationThreshold = options[@"classificationThreshold"];
    if (classificationThreshold != nil) {
        detectorOptions.classificationConfidenceThreshold = [classificationThreshold floatValue];
    } else {
        detectorOptions.classificationConfidenceThreshold = 0.5;
    }
    
    // Create the detector
    MLKObjectDetector *objectDetector = [MLKObjectDetector objectDetectorWithOptions:detectorOptions];
    
    // Process the image
    [objectDetector processImage:visionImage
                      completion:^(NSArray<MLKObject *> * _Nullable objects,
                                   NSError * _Nullable error) {
        if (error) {
            reject(@"E_OBJECT_DETECTION", error.localizedDescription, error);
            return;
        }
        
        NSMutableArray *results = [NSMutableArray array];
        
        for (MLKObject *object in objects) {
            NSMutableDictionary *objectDict = [NSMutableDictionary dictionary];
            
            // Get bounding box
            CGRect boundingBox = object.frame;
            NSDictionary *frame = @{
                @"left": @(boundingBox.origin.x),
                @"top": @(boundingBox.origin.y),
                @"width": @(boundingBox.size.width),
                @"height": @(boundingBox.size.height)
            };
            objectDict[@"frame"] = frame;
            
            // Get tracking ID if available
            NSNumber *trackingEnabled = options[@"trackingEnabled"];
            if (trackingEnabled != nil && [trackingEnabled boolValue] && object.trackingID != nil) {
                objectDict[@"trackingID"] = object.trackingID;
            }
            
            // Get labels
            NSMutableArray *labels = [NSMutableArray array];
            for (MLKObjectLabel *label in object.labels) {
                NSDictionary *labelDict = @{
                    @"text": label.text ?: @"",
                    @"confidence": @(label.confidence),
                    @"index": @(label.index)
                };
                [labels addObject:labelDict];
            }
            objectDict[@"labels"] = labels;
            
            [results addObject:objectDict];
        }
        
        resolve(results);
    }];
}

@end