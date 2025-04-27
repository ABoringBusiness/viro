package com.viromedia.bridge.speechrecognition;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class ViroSpeechRecognitionModule extends ReactContextBaseJavaModule implements PermissionListener {
    private static final String TAG = "ViroSpeechRecognition";
    private static final int PERMISSION_REQUEST_RECORD_AUDIO = 1;
    
    private final ReactApplicationContext reactContext;
    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;
    private boolean isContinuous = false;
    private String languageCode = "en-US";
    private int maxDuration = 10000;
    private boolean partialResults = true;
    private boolean preferOnDevice = true;
    private boolean filterProfanity = false;
    private boolean stopOnSilence = true;
    private int silenceTimeout = 1500;
    private Promise permissionPromise;
    
    // Speech recognition states
    private static final String STATE_INACTIVE = "inactive";
    private static final String STATE_LISTENING = "listening";
    private static final String STATE_PROCESSING = "processing";
    private static final String STATE_STOPPED = "stopped";
    private static final String STATE_ERROR = "error";
    
    // Speech recognition engines
    private static final String ENGINE_GOOGLE = "google";
    private static final String ENGINE_ML_KIT = "mlkit";
    private static final String ENGINE_DEFAULT = "default";
    
    public ViroSpeechRecognitionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ViroSpeechRecognition";
    }
    
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        
        // Speech recognition states
        constants.put("STATE_INACTIVE", STATE_INACTIVE);
        constants.put("STATE_LISTENING", STATE_LISTENING);
        constants.put("STATE_PROCESSING", STATE_PROCESSING);
        constants.put("STATE_STOPPED", STATE_STOPPED);
        constants.put("STATE_ERROR", STATE_ERROR);
        
        // Speech recognition engines
        constants.put("ENGINE_GOOGLE", ENGINE_GOOGLE);
        constants.put("ENGINE_ML_KIT", ENGINE_ML_KIT);
        constants.put("ENGINE_DEFAULT", ENGINE_DEFAULT);
        
        return constants;
    }
    
    @ReactMethod
    public void setOptions(ReadableMap options) {
        if (options.hasKey("languageCode")) {
            languageCode = options.getString("languageCode");
        }
        
        if (options.hasKey("maxDuration")) {
            maxDuration = options.getInt("maxDuration");
        }
        
        if (options.hasKey("continuous")) {
            isContinuous = options.getBoolean("continuous");
        }
        
        if (options.hasKey("partialResults")) {
            partialResults = options.getBoolean("partialResults");
        }
        
        if (options.hasKey("preferOnDevice")) {
            preferOnDevice = options.getBoolean("preferOnDevice");
        }
        
        if (options.hasKey("filterProfanity")) {
            filterProfanity = options.getBoolean("filterProfanity");
        }
        
        if (options.hasKey("stopOnSilence")) {
            stopOnSilence = options.getBoolean("stopOnSilence");
        }
        
        if (options.hasKey("silenceTimeout")) {
            silenceTimeout = options.getInt("silenceTimeout");
        }
    }
    
    @ReactMethod
    public void start(ReadableMap options, Promise promise) {
        if (isListening) {
            promise.reject("already_listening", "Speech recognition is already running");
            return;
        }
        
        // Update options if provided
        if (options != null) {
            setOptions(options);
        }
        
        // Check for permission
        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.RECORD_AUDIO) 
                != PackageManager.PERMISSION_GRANTED) {
            permissionPromise = promise;
            requestPermission();
            return;
        }
        
        try {
            initializeSpeechRecognizer();
            startListening();
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("start_error", "Error starting speech recognition: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void stop(Promise promise) {
        if (!isListening || speechRecognizer == null) {
            promise.reject("not_listening", "Speech recognition is not running");
            return;
        }
        
        try {
            speechRecognizer.stopListening();
            isListening = false;
            sendStateChangeEvent(STATE_STOPPED);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("stop_error", "Error stopping speech recognition: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void cancel(Promise promise) {
        if (speechRecognizer == null) {
            promise.resolve(null);
            return;
        }
        
        try {
            speechRecognizer.cancel();
            isListening = false;
            sendStateChangeEvent(STATE_INACTIVE);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("cancel_error", "Error canceling speech recognition: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void isSupported(String engine, Promise promise) {
        boolean isSupported = SpeechRecognizer.isRecognitionAvailable(reactContext);
        
        // For ML Kit, we need to check if the ML Kit library is available
        if (engine.equals(ENGINE_ML_KIT)) {
            try {
                Class.forName("com.google.mlkit.nl.speechrecognition.SpeechRecognition");
                promise.resolve(isSupported);
            } catch (ClassNotFoundException e) {
                promise.resolve(false);
            }
        } else {
            promise.resolve(isSupported);
        }
    }
    
    @ReactMethod
    public void getAvailableLanguages(Promise promise) {
        List<String> languages = new ArrayList<>();
        
        // Add common languages supported by Android's speech recognition
        languages.addAll(Arrays.asList(
            "en-US", "en-GB", "fr-FR", "de-DE", "it-IT", "es-ES", "ja-JP", 
            "ko-KR", "zh-CN", "zh-TW", "ru-RU", "pt-BR", "nl-NL", "pl-PL", 
            "tr-TR", "ar-SA", "th-TH", "sv-SE", "da-DK", "no-NO", "fi-FI"
        ));
        
        WritableArray result = Arguments.createArray();
        for (String language : languages) {
            result.pushString(language);
        }
        
        promise.resolve(result);
    }
    
    private void initializeSpeechRecognizer() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
        
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override
            public void onReadyForSpeech(Bundle bundle) {
                sendStateChangeEvent(STATE_LISTENING);
            }

            @Override
            public void onBeginningOfSpeech() {
                // No action needed
            }

            @Override
            public void onRmsChanged(float v) {
                // Convert RMS to a 0-1 scale for consistency across platforms
                float normalizedVolume = Math.min(1.0f, Math.max(0.0f, v / 10.0f));
                sendVolumeChangeEvent(normalizedVolume);
            }

            @Override
            public void onBufferReceived(byte[] bytes) {
                // No action needed
            }

            @Override
            public void onEndOfSpeech() {
                sendStateChangeEvent(STATE_PROCESSING);
            }

            @Override
            public void onError(int errorCode) {
                isListening = false;
                
                String errorMessage;
                String errorCodeString;
                
                switch (errorCode) {
                    case SpeechRecognizer.ERROR_AUDIO:
                        errorMessage = "Audio recording error";
                        errorCodeString = "audio_error";
                        break;
                    case SpeechRecognizer.ERROR_CLIENT:
                        errorMessage = "Client side error";
                        errorCodeString = "client_error";
                        break;
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                        errorMessage = "Insufficient permissions";
                        errorCodeString = "permission_error";
                        break;
                    case SpeechRecognizer.ERROR_NETWORK:
                        errorMessage = "Network error";
                        errorCodeString = "network_error";
                        break;
                    case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                        errorMessage = "Network timeout";
                        errorCodeString = "network_timeout";
                        break;
                    case SpeechRecognizer.ERROR_NO_MATCH:
                        errorMessage = "No recognition result matched";
                        errorCodeString = "no_match";
                        break;
                    case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                        errorMessage = "Recognition service busy";
                        errorCodeString = "recognizer_busy";
                        break;
                    case SpeechRecognizer.ERROR_SERVER:
                        errorMessage = "Server error";
                        errorCodeString = "server_error";
                        break;
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                        errorMessage = "No speech input";
                        errorCodeString = "speech_timeout";
                        break;
                    default:
                        errorMessage = "Unknown error";
                        errorCodeString = "unknown_error";
                        break;
                }
                
                sendErrorEvent(errorCodeString, errorMessage);
                sendStateChangeEvent(STATE_ERROR);
                
                // Restart listening if continuous mode is enabled and it's not a critical error
                if (isContinuous && 
                    errorCode != SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS &&
                    errorCode != SpeechRecognizer.ERROR_RECOGNIZER_BUSY) {
                    startListening();
                }
            }

            @Override
            public void onResults(Bundle results) {
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                float[] confidenceScores = results.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES);
                
                if (matches != null && !matches.isEmpty()) {
                    String text = matches.get(0);
                    float confidence = (confidenceScores != null && confidenceScores.length > 0) ? 
                            confidenceScores[0] : 0.0f;
                    
                    WritableMap result = Arguments.createMap();
                    result.putString("text", text);
                    result.putBoolean("isFinal", true);
                    result.putDouble("confidence", confidence);
                    
                    if (matches.size() > 1) {
                        WritableArray alternatives = Arguments.createArray();
                        for (int i = 1; i < matches.size(); i++) {
                            WritableMap alternative = Arguments.createMap();
                            alternative.putString("text", matches.get(i));
                            alternative.putDouble("confidence", 
                                    (confidenceScores != null && i < confidenceScores.length) ? 
                                    confidenceScores[i] : 0.0f);
                            alternatives.pushMap(alternative);
                        }
                        result.putArray("alternatives", alternatives);
                    }
                    
                    sendResultEvent(result);
                }
                
                isListening = false;
                sendStateChangeEvent(STATE_INACTIVE);
                
                // Restart listening if continuous mode is enabled
                if (isContinuous) {
                    startListening();
                }
            }

            @Override
            public void onPartialResults(Bundle partialResults) {
                if (!partialResults) {
                    return;
                }
                
                ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                
                if (matches != null && !matches.isEmpty()) {
                    String text = matches.get(0);
                    
                    WritableMap result = Arguments.createMap();
                    result.putString("text", text);
                    result.putBoolean("isFinal", false);
                    result.putDouble("confidence", 0.0); // Partial results don't have confidence scores
                    
                    sendResultEvent(result);
                }
            }

            @Override
            public void onEvent(int eventType, Bundle params) {
                // No action needed
            }
        });
    }
    
    private void startListening() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, languageCode);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partialResults);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, silenceTimeout);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, silenceTimeout);
        
        if (preferOnDevice) {
            intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        }
        
        if (maxDuration > 0) {
            intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, maxDuration);
        }
        
        speechRecognizer.startListening(intent);
        isListening = true;
    }
    
    private void requestPermission() {
        if (getCurrentActivity() != null) {
            ((PermissionAwareActivity) getCurrentActivity()).requestPermissions(
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    PERMISSION_REQUEST_RECORD_AUDIO,
                    this
            );
        } else {
            if (permissionPromise != null) {
                permissionPromise.reject("activity_not_found", "Activity not found");
                permissionPromise = null;
            }
        }
    }
    
    @Override
    public boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == PERMISSION_REQUEST_RECORD_AUDIO) {
            if (permissionPromise != null) {
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    try {
                        initializeSpeechRecognizer();
                        startListening();
                        permissionPromise.resolve(null);
                    } catch (Exception e) {
                        permissionPromise.reject("start_error", "Error starting speech recognition: " + e.getMessage());
                    }
                } else {
                    permissionPromise.reject("permission_denied", "Permission denied");
                }
                permissionPromise = null;
            }
            return true;
        }
        return false;
    }
    
    private void sendStateChangeEvent(String state) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSpeechStateChange", state);
    }
    
    private void sendResultEvent(WritableMap result) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSpeechResult", result);
    }
    
    private void sendErrorEvent(String code, String message) {
        WritableMap error = Arguments.createMap();
        error.putString("code", code);
        error.putString("message", message);
        
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSpeechError", error);
    }
    
    private void sendVolumeChangeEvent(float volume) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSpeechVolumeChange", volume);
    }
    
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
    }
}