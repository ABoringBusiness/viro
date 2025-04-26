package com.viromedia.bridge.mlkit;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.mlkit.common.MlKitException;
import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.common.model.RemoteModelManager;
import com.google.mlkit.vision.digitalink.DigitalInkRecognition;
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModel;
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModelIdentifier;
import com.google.mlkit.vision.digitalink.DigitalInkRecognizer;
import com.google.mlkit.vision.digitalink.DigitalInkRecognizerOptions;
import com.google.mlkit.vision.digitalink.Ink;
import com.google.mlkit.vision.digitalink.RecognitionCandidate;
import com.google.mlkit.vision.digitalink.RecognitionResult;

import java.util.ArrayList;
import java.util.List;

public class ViroDigitalInkRecognitionModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ViroDigitalInkRecognitionModule";
    private final ReactApplicationContext reactContext;
    private DigitalInkRecognizer recognizer;
    private RemoteModelManager remoteModelManager;

    public ViroDigitalInkRecognitionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.remoteModelManager = RemoteModelManager.getInstance();
    }

    @Override
    public String getName() {
        return "ViroDigitalInkRecognition";
    }

    @ReactMethod
    public void recognize(ReadableArray strokes, ReadableMap options, Promise promise) {
        try {
            // Get language code from options
            String languageCode = "en";
            if (options.hasKey("languageCode")) {
                languageCode = options.getString("languageCode");
            }

            // Get max result count
            int maxResultCount = 1;
            if (options.hasKey("maxResultCount")) {
                maxResultCount = options.getInt("maxResultCount");
            }

            // Check if auto download is enabled
            boolean autoDownloadModel = true;
            if (options.hasKey("autoDownloadModel")) {
                autoDownloadModel = options.getBoolean("autoDownloadModel");
            }

            // Get model identifier
            DigitalInkRecognitionModelIdentifier modelIdentifier;
            try {
                modelIdentifier = DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageCode);
                if (modelIdentifier == null) {
                    promise.reject("E_LANGUAGE_NOT_SUPPORTED", "Language " + languageCode + " is not supported");
                    return;
                }
            } catch (Exception e) {
                promise.reject("E_LANGUAGE_IDENTIFIER", "Error getting model identifier: " + e.getMessage(), e);
                return;
            }

            // Create the model
            final DigitalInkRecognitionModel model = DigitalInkRecognitionModel.builder(modelIdentifier).build();

            // Check if model is downloaded
            remoteModelManager.isModelDownloaded(model)
                    .addOnSuccessListener(new OnSuccessListener<Boolean>() {
                        @Override
                        public void onSuccess(Boolean isDownloaded) {
                            if (!isDownloaded) {
                                if (autoDownloadModel) {
                                    // Download the model
                                    DownloadConditions conditions = new DownloadConditions.Builder().build();
                                    remoteModelManager.download(model, conditions)
                                            .addOnSuccessListener(new OnSuccessListener<Void>() {
                                                @Override
                                                public void onSuccess(Void unused) {
                                                    // Model downloaded, proceed with recognition
                                                    performRecognition(strokes, model, maxResultCount, promise);
                                                }
                                            })
                                            .addOnFailureListener(new OnFailureListener() {
                                                @Override
                                                public void onFailure(@NonNull Exception e) {
                                                    promise.reject("E_MODEL_DOWNLOAD", "Failed to download model: " + e.getMessage(), e);
                                                }
                                            });
                                } else {
                                    promise.reject("E_MODEL_NOT_DOWNLOADED", "Model for " + languageCode + " is not downloaded");
                                }
                            } else {
                                // Model is already downloaded, proceed with recognition
                                performRecognition(strokes, model, maxResultCount, promise);
                            }
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("E_MODEL_CHECK", "Failed to check if model is downloaded: " + e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("E_RECOGNITION", "Recognition error: " + e.getMessage(), e);
        }
    }

    private void performRecognition(ReadableArray strokesArray, DigitalInkRecognitionModel model, int maxResultCount, Promise promise) {
        try {
            // Create recognizer
            DigitalInkRecognizerOptions options = DigitalInkRecognizerOptions.builder(model)
                    .setMaxResultCount(maxResultCount)
                    .build();
            recognizer = DigitalInkRecognition.getClient(options);

            // Convert React Native strokes to ML Kit Ink
            Ink.Builder inkBuilder = Ink.builder();
            
            for (int i = 0; i < strokesArray.size(); i++) {
                ReadableMap strokeMap = strokesArray.getMap(i);
                ReadableArray pointsArray = strokeMap.getArray("points");
                
                Ink.Stroke.Builder strokeBuilder = Ink.Stroke.builder();
                
                for (int j = 0; j < pointsArray.size(); j++) {
                    ReadableMap pointMap = pointsArray.getMap(j);
                    float x = (float) pointMap.getDouble("x");
                    float y = (float) pointMap.getDouble("y");
                    long t = (long) pointMap.getDouble("t");
                    
                    strokeBuilder.addPoint(Ink.Point.create(x, y, t));
                }
                
                inkBuilder.addStroke(strokeBuilder.build());
            }
            
            Ink ink = inkBuilder.build();
            
            // Perform recognition
            recognizer.recognize(ink)
                    .addOnSuccessListener(new OnSuccessListener<RecognitionResult>() {
                        @Override
                        public void onSuccess(RecognitionResult result) {
                            WritableArray candidates = Arguments.createArray();
                            
                            for (RecognitionCandidate candidate : result.getCandidates()) {
                                WritableMap candidateMap = Arguments.createMap();
                                candidateMap.putString("text", candidate.getText());
                                candidateMap.putDouble("score", candidate.getScore());
                                candidates.pushMap(candidateMap);
                            }
                            
                            promise.resolve(candidates);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("E_RECOGNITION_FAILED", "Recognition failed: " + e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("E_RECOGNITION_PROCESS", "Error during recognition process: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void isLanguageModelAvailable(String languageCode, Promise promise) {
        try {
            DigitalInkRecognitionModelIdentifier modelIdentifier = 
                DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageCode);
            
            if (modelIdentifier == null) {
                promise.resolve(false);
                return;
            }
            
            DigitalInkRecognitionModel model = 
                DigitalInkRecognitionModel.builder(modelIdentifier).build();
            
            remoteModelManager.isModelDownloaded(model)
                    .addOnSuccessListener(new OnSuccessListener<Boolean>() {
                        @Override
                        public void onSuccess(Boolean isDownloaded) {
                            promise.resolve(isDownloaded);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("E_MODEL_CHECK", "Failed to check if model is downloaded: " + e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("E_LANGUAGE_CHECK", "Error checking language availability: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void downloadLanguageModel(String languageCode, Promise promise) {
        try {
            DigitalInkRecognitionModelIdentifier modelIdentifier = 
                DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageCode);
            
            if (modelIdentifier == null) {
                promise.reject("E_LANGUAGE_NOT_SUPPORTED", "Language " + languageCode + " is not supported");
                return;
            }
            
            DigitalInkRecognitionModel model = 
                DigitalInkRecognitionModel.builder(modelIdentifier).build();
            
            DownloadConditions conditions = new DownloadConditions.Builder().build();
            
            remoteModelManager.download(model, conditions)
                    .addOnSuccessListener(new OnSuccessListener<Void>() {
                        @Override
                        public void onSuccess(Void unused) {
                            promise.resolve(null);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("E_MODEL_DOWNLOAD", "Failed to download model: " + e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("E_DOWNLOAD_MODEL", "Error downloading model: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void deleteLanguageModel(String languageCode, Promise promise) {
        try {
            DigitalInkRecognitionModelIdentifier modelIdentifier = 
                DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageCode);
            
            if (modelIdentifier == null) {
                promise.reject("E_LANGUAGE_NOT_SUPPORTED", "Language " + languageCode + " is not supported");
                return;
            }
            
            DigitalInkRecognitionModel model = 
                DigitalInkRecognitionModel.builder(modelIdentifier).build();
            
            remoteModelManager.deleteDownloadedModel(model)
                    .addOnSuccessListener(new OnSuccessListener<Void>() {
                        @Override
                        public void onSuccess(Void unused) {
                            promise.resolve(null);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("E_MODEL_DELETE", "Failed to delete model: " + e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("E_DELETE_MODEL", "Error deleting model: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getAvailableLanguages(Promise promise) {
        try {
            List<String> languageTags = new ArrayList<>();
            for (DigitalInkRecognitionModelIdentifier modelIdentifier : 
                    DigitalInkRecognitionModelIdentifier.allModelIdentifiers()) {
                if (modelIdentifier.getLanguageTag() != null) {
                    languageTags.add(modelIdentifier.getLanguageTag());
                }
            }
            
            WritableArray result = Arguments.createArray();
            for (String tag : languageTags) {
                result.pushString(tag);
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("E_AVAILABLE_LANGUAGES", "Error getting available languages: " + e.getMessage(), e);
        }
    }
}