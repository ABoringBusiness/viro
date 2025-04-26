package com.viromedia.bridge.mlkit;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Rect;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.objects.DetectedObject;
import com.google.mlkit.vision.objects.ObjectDetection;
import com.google.mlkit.vision.objects.ObjectDetector;
import com.google.mlkit.vision.objects.ObjectDetectorOptionsBase;
import com.google.mlkit.vision.objects.defaults.ObjectDetectorOptions;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class ViroObjectDetectionModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ViroObjectDetectionModule";
    private final ReactApplicationContext reactContext;
    private ObjectDetector objectDetector;

    public ViroObjectDetectionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ViroObjectDetection";
    }

    @ReactMethod
    public void detect(String imageURL, ReadableMap options, Promise promise) {
        try {
            // Create options for the detector
            ObjectDetectorOptions.Builder optionsBuilder = new ObjectDetectorOptions.Builder();

            // Set performance mode
            if (options.hasKey("performanceMode") && options.getString("performanceMode").equals("accurate")) {
                optionsBuilder.setDetectorMode(ObjectDetectorOptions.SINGLE_IMAGE_MODE);
            } else {
                optionsBuilder.setDetectorMode(ObjectDetectorOptions.SINGLE_IMAGE_MODE);
            }

            // Set multiple objects detection
            boolean multipleObjects = true;
            if (options.hasKey("multipleObjects")) {
                multipleObjects = options.getBoolean("multipleObjects");
            }
            optionsBuilder.setMultipleObjectsEnabled(multipleObjects);

            // Set object tracking
            boolean trackingEnabled = false;
            if (options.hasKey("trackingEnabled")) {
                trackingEnabled = options.getBoolean("trackingEnabled");
            }
            if (trackingEnabled) {
                optionsBuilder.enableMultipleObjects();
                optionsBuilder.enableClassification();
            }

            // Set classification threshold
            float classificationThreshold = 0.5f;
            if (options.hasKey("classificationThreshold")) {
                classificationThreshold = (float) options.getDouble("classificationThreshold");
            }
            optionsBuilder.setClassificationConfidenceThreshold(classificationThreshold);

            // Set max objects to detect
            int maxObjectsToDetect = 5;
            if (options.hasKey("maxObjectsToDetect")) {
                maxObjectsToDetect = options.getInt("maxObjectsToDetect");
            }
            optionsBuilder.setMaxPerObjectLabelCount(maxObjectsToDetect);

            // Create the detector
            objectDetector = ObjectDetection.getClient(optionsBuilder.build());

            // Process the image
            InputImage image = getInputImageFromURL(imageURL);
            if (image == null) {
                promise.reject("E_INPUT_IMAGE", "Could not create input image from URL");
                return;
            }

            objectDetector.process(image)
                    .addOnSuccessListener(new OnSuccessListener<List<DetectedObject>>() {
                        @Override
                        public void onSuccess(List<DetectedObject> detectedObjects) {
                            WritableArray results = Arguments.createArray();

                            for (DetectedObject detectedObject : detectedObjects) {
                                WritableMap objectMap = Arguments.createMap();
                                
                                // Get bounding box
                                Rect boundingBox = detectedObject.getBoundingBox();
                                WritableMap frame = Arguments.createMap();
                                frame.putInt("left", boundingBox.left);
                                frame.putInt("top", boundingBox.top);
                                frame.putInt("width", boundingBox.width());
                                frame.putInt("height", boundingBox.height());
                                objectMap.putMap("frame", frame);
                                
                                // Get tracking ID if available
                                if (trackingEnabled && detectedObject.getTrackingId() != null) {
                                    objectMap.putInt("trackingID", detectedObject.getTrackingId());
                                }
                                
                                // Get labels
                                WritableArray labels = Arguments.createArray();
                                for (DetectedObject.Label label : detectedObject.getLabels()) {
                                    WritableMap labelMap = Arguments.createMap();
                                    labelMap.putString("text", label.getText());
                                    labelMap.putDouble("confidence", label.getConfidence());
                                    labelMap.putInt("index", label.getIndex());
                                    labels.pushMap(labelMap);
                                }
                                objectMap.putArray("labels", labels);
                                
                                results.pushMap(objectMap);
                            }
                            
                            promise.resolve(results);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("E_OBJECT_DETECTION", e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("E_OBJECT_DETECTION", e.getMessage(), e);
        }
    }

    private InputImage getInputImageFromURL(String imageURL) {
        try {
            if (imageURL.startsWith("file://")) {
                Uri uri = Uri.parse(imageURL);
                return InputImage.fromFilePath(reactContext, uri);
            } else {
                InputStream inputStream = new java.net.URL(imageURL).openStream();
                Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                if (bitmap == null) {
                    Log.e(TAG, "Could not decode bitmap from URL");
                    return null;
                }
                return InputImage.fromBitmap(bitmap, 0);
            }
        } catch (IOException e) {
            Log.e(TAG, "Error getting input image from URL", e);
            return null;
        }
    }
}