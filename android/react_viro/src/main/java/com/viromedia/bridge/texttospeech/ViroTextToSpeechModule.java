package com.viromedia.bridge.texttospeech;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class ViroTextToSpeechModule extends ReactContextBaseJavaModule implements TextToSpeech.OnInitListener {
    private static final String TAG = "ViroTextToSpeechModule";
    
    private final ReactApplicationContext reactContext;
    private TextToSpeech textToSpeech;
    private boolean isInitialized = false;
    private String currentUtteranceId = null;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private int originalStreamVolume = -1;
    
    // TTS states
    private static final String STATE_IDLE = "idle";
    private static final String STATE_SPEAKING = "speaking";
    private static final String STATE_PAUSED = "paused";
    private static final String STATE_STOPPED = "stopped";
    private static final String STATE_ERROR = "error";
    
    // TTS engines
    private static final String ENGINE_GOOGLE = "google";
    private static final String ENGINE_ANDROID = "android";
    private static final String ENGINE_DEFAULT = "default";
    
    // TTS voice genders
    private static final String GENDER_MALE = "male";
    private static final String GENDER_FEMALE = "female";
    private static final String GENDER_NEUTRAL = "neutral";
    
    // Default options
    private String languageCode = "en-US";
    private String voiceId = null;
    private String voiceGender = GENDER_FEMALE;
    private float rate = 1.0f;
    private float pitch = 1.0f;
    private float volume = 1.0f;
    private boolean preferOnDevice = true;
    private boolean useSsml = false;
    private boolean audioDucking = true;
    private boolean queueUtterances = false;
    
    public ViroTextToSpeechModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        initTTS();
    }

    @Override
    public String getName() {
        return "ViroTextToSpeech";
    }
    
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        
        // TTS states
        constants.put("STATE_IDLE", STATE_IDLE);
        constants.put("STATE_SPEAKING", STATE_SPEAKING);
        constants.put("STATE_PAUSED", STATE_PAUSED);
        constants.put("STATE_STOPPED", STATE_STOPPED);
        constants.put("STATE_ERROR", STATE_ERROR);
        
        // TTS engines
        constants.put("ENGINE_GOOGLE", ENGINE_GOOGLE);
        constants.put("ENGINE_ANDROID", ENGINE_ANDROID);
        constants.put("ENGINE_DEFAULT", ENGINE_DEFAULT);
        
        // TTS voice genders
        constants.put("GENDER_MALE", GENDER_MALE);
        constants.put("GENDER_FEMALE", GENDER_FEMALE);
        constants.put("GENDER_NEUTRAL", GENDER_NEUTRAL);
        
        return constants;
    }
    
    private void initTTS() {
        if (textToSpeech != null) {
            textToSpeech.shutdown();
        }
        
        textToSpeech = new TextToSpeech(reactContext, this);
        textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {
                currentUtteranceId = utteranceId;
                sendStateChangeEvent(STATE_SPEAKING);
                
                WritableMap params = Arguments.createMap();
                params.putString("id", utteranceId);
                params.putString("text", ""); // We don't have the text here, but we need to send something
                
                sendEvent("onTtsStart", params);
            }

            @Override
            public void onDone(String utteranceId) {
                if (utteranceId.equals(currentUtteranceId)) {
                    currentUtteranceId = null;
                    abandonAudioFocus();
                    sendStateChangeEvent(STATE_IDLE);
                    
                    WritableMap params = Arguments.createMap();
                    params.putString("id", utteranceId);
                    params.putString("text", ""); // We don't have the text here, but we need to send something
                    
                    sendEvent("onTtsEnd", params);
                }
            }

            @Override
            public void onError(String utteranceId) {
                if (utteranceId.equals(currentUtteranceId)) {
                    currentUtteranceId = null;
                    abandonAudioFocus();
                    sendStateChangeEvent(STATE_ERROR);
                    
                    WritableMap params = Arguments.createMap();
                    params.putString("code", "tts_error");
                    params.putString("message", "An error occurred during speech synthesis");
                    
                    WritableMap utterance = Arguments.createMap();
                    utterance.putString("id", utteranceId);
                    utterance.putString("text", ""); // We don't have the text here, but we need to send something
                    
                    params.putMap("utterance", utterance);
                    
                    sendEvent("onTtsError", params);
                }
            }
            
            @Override
            public void onRangeStart(String utteranceId, int start, int end, int frame) {
                WritableMap params = Arguments.createMap();
                params.putString("utteranceId", utteranceId);
                params.putInt("start", start);
                params.putInt("end", end);
                
                sendEvent("onTtsRange", params);
            }
        });
    }
    
    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true;
            
            // Set default language
            setLanguage(languageCode);
            
            // Set default voice if specified
            if (voiceId != null) {
                setVoice(voiceId);
            } else if (voiceGender != null) {
                setVoiceByGender(voiceGender);
            }
            
            // Set speech parameters
            textToSpeech.setSpeechRate(rate);
            textToSpeech.setPitch(pitch);
            
            sendStateChangeEvent(STATE_IDLE);
        } else {
            isInitialized = false;
            sendStateChangeEvent(STATE_ERROR);
            
            WritableMap params = Arguments.createMap();
            params.putString("code", "init_error");
            params.putString("message", "Failed to initialize text-to-speech engine");
            
            sendEvent("onTtsError", params);
        }
    }
    
    @ReactMethod
    public void setOptions(ReadableMap options) {
        if (options.hasKey("languageCode")) {
            languageCode = options.getString("languageCode");
            setLanguage(languageCode);
        }
        
        if (options.hasKey("voiceId")) {
            voiceId = options.getString("voiceId");
            setVoice(voiceId);
        }
        
        if (options.hasKey("voiceGender")) {
            voiceGender = options.getString("voiceGender");
            if (voiceId == null) {
                setVoiceByGender(voiceGender);
            }
        }
        
        if (options.hasKey("rate")) {
            rate = (float) options.getDouble("rate");
            if (isInitialized) {
                textToSpeech.setSpeechRate(rate);
            }
        }
        
        if (options.hasKey("pitch")) {
            pitch = (float) options.getDouble("pitch");
            if (isInitialized) {
                textToSpeech.setPitch(pitch);
            }
        }
        
        if (options.hasKey("volume")) {
            volume = (float) options.getDouble("volume");
        }
        
        if (options.hasKey("preferOnDevice")) {
            preferOnDevice = options.getBoolean("preferOnDevice");
        }
        
        if (options.hasKey("useSsml")) {
            useSsml = options.getBoolean("useSsml");
        }
        
        if (options.hasKey("audioDucking")) {
            audioDucking = options.getBoolean("audioDucking");
        }
        
        if (options.hasKey("queueUtterances")) {
            queueUtterances = options.getBoolean("queueUtterances");
        }
    }
    
    @ReactMethod
    public void speak(String text, String utteranceId, ReadableMap options, Promise promise) {
        if (!isInitialized) {
            promise.reject("not_initialized", "Text-to-speech engine is not initialized");
            return;
        }
        
        // Apply utterance-specific options if provided
        if (options != null) {
            applyUtteranceOptions(options);
        }
        
        try {
            // Request audio focus
            requestAudioFocus();
            
            int queueMode = queueUtterances ? TextToSpeech.QUEUE_ADD : TextToSpeech.QUEUE_FLUSH;
            
            Bundle params = new Bundle();
            params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, volume);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                if (useSsml) {
                    textToSpeech.speak(text, queueMode, params, utteranceId);
                } else {
                    textToSpeech.speak(text, queueMode, params, utteranceId);
                }
            } else {
                HashMap<String, String> hashParams = new HashMap<>();
                hashParams.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
                hashParams.put(TextToSpeech.Engine.KEY_PARAM_VOLUME, String.valueOf(volume));
                
                textToSpeech.speak(text, queueMode, hashParams);
            }
            
            promise.resolve(utteranceId);
        } catch (Exception e) {
            promise.reject("speak_error", "Error speaking text: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void stop(Promise promise) {
        if (!isInitialized) {
            promise.reject("not_initialized", "Text-to-speech engine is not initialized");
            return;
        }
        
        try {
            textToSpeech.stop();
            abandonAudioFocus();
            currentUtteranceId = null;
            sendStateChangeEvent(STATE_STOPPED);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("stop_error", "Error stopping speech: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void pause(Promise promise) {
        if (!isInitialized) {
            promise.reject("not_initialized", "Text-to-speech engine is not initialized");
            return;
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                int result = textToSpeech.stop("pause");
                if (result == TextToSpeech.SUCCESS) {
                    sendStateChangeEvent(STATE_PAUSED);
                    promise.resolve(null);
                } else {
                    promise.reject("pause_error", "Failed to pause speech");
                }
            } catch (Exception e) {
                promise.reject("pause_error", "Error pausing speech: " + e.getMessage());
            }
        } else {
            // Older Android versions don't support pause, so we'll just stop
            try {
                textToSpeech.stop();
                sendStateChangeEvent(STATE_STOPPED);
                promise.resolve(null);
            } catch (Exception e) {
                promise.reject("pause_error", "Error stopping speech: " + e.getMessage());
            }
        }
    }
    
    @ReactMethod
    public void resume(Promise promise) {
        if (!isInitialized) {
            promise.reject("not_initialized", "Text-to-speech engine is not initialized");
            return;
        }
        
        // Android doesn't have a direct resume function, so we can't implement this properly
        promise.reject("not_supported", "Resume is not supported on Android");
    }
    
    @ReactMethod
    public void getVoices(String languageCode, Promise promise) {
        if (!isInitialized) {
            promise.reject("not_initialized", "Text-to-speech engine is not initialized");
            return;
        }
        
        try {
            WritableArray voices = Arguments.createArray();
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                Set<Voice> availableVoices = textToSpeech.getVoices();
                
                for (Voice voice : availableVoices) {
                    Locale locale = voice.getLocale();
                    String voiceLanguageCode = locale.getLanguage() + "-" + locale.getCountry();
                    
                    // Filter by language code if provided
                    if (languageCode != null && !languageCode.isEmpty() && !voiceLanguageCode.startsWith(languageCode)) {
                        continue;
                    }
                    
                    WritableMap voiceMap = Arguments.createMap();
                    voiceMap.putString("id", voice.getName());
                    voiceMap.putString("name", voice.getName());
                    voiceMap.putString("languageCode", voiceLanguageCode);
                    
                    // Determine gender based on voice name (this is a heuristic)
                    String gender = GENDER_NEUTRAL;
                    String lowerName = voice.getName().toLowerCase();
                    if (lowerName.contains("female") || lowerName.contains("woman") || lowerName.contains("girl")) {
                        gender = GENDER_FEMALE;
                    } else if (lowerName.contains("male") || lowerName.contains("man") || lowerName.contains("boy")) {
                        gender = GENDER_MALE;
                    }
                    voiceMap.putString("gender", gender);
                    
                    voiceMap.putBoolean("isOfflineAvailable", !voice.isNetworkConnectionRequired());
                    voiceMap.putBoolean("isNeural", voice.getQuality() > Voice.QUALITY_NORMAL);
                    
                    voices.pushMap(voiceMap);
                }
            } else {
                // For older Android versions, we can only get the default voice
                Locale defaultLocale = Locale.getDefault();
                String voiceLanguageCode = defaultLocale.getLanguage() + "-" + defaultLocale.getCountry();
                
                // Filter by language code if provided
                if (languageCode == null || languageCode.isEmpty() || voiceLanguageCode.startsWith(languageCode)) {
                    WritableMap voiceMap = Arguments.createMap();
                    voiceMap.putString("id", "default");
                    voiceMap.putString("name", "Default");
                    voiceMap.putString("languageCode", voiceLanguageCode);
                    voiceMap.putString("gender", GENDER_NEUTRAL);
                    voiceMap.putBoolean("isOfflineAvailable", true);
                    voiceMap.putBoolean("isNeural", false);
                    
                    voices.pushMap(voiceMap);
                }
            }
            
            promise.resolve(voices);
        } catch (Exception e) {
            promise.reject("get_voices_error", "Error getting voices: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void isSupported(String engine, Promise promise) {
        // Android's TTS is always supported
        promise.resolve(true);
    }
    
    @ReactMethod
    public void synthesizeToFile(String text, String filePath, ReadableMap options, Promise promise) {
        if (!isInitialized) {
            promise.reject("not_initialized", "Text-to-speech engine is not initialized");
            return;
        }
        
        // Apply options if provided
        if (options != null) {
            applyUtteranceOptions(options);
        }
        
        try {
            String utteranceId = "synthesis_" + System.currentTimeMillis();
            File file = new File(filePath);
            
            // Ensure directory exists
            File directory = file.getParentFile();
            if (directory != null && !directory.exists()) {
                directory.mkdirs();
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                Bundle params = new Bundle();
                params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, volume);
                
                int result;
                if (options != null && options.hasKey("useSsml") && options.getBoolean("useSsml")) {
                    result = textToSpeech.synthesizeToFile(text, params, file, utteranceId);
                } else {
                    result = textToSpeech.synthesizeToFile(text, params, file, utteranceId);
                }
                
                if (result == TextToSpeech.SUCCESS) {
                    promise.resolve(filePath);
                } else {
                    promise.reject("synthesis_error", "Failed to synthesize speech to file");
                }
            } else {
                HashMap<String, String> params = new HashMap<>();
                params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
                
                int result = textToSpeech.synthesizeToFile(text, params, filePath);
                
                if (result == TextToSpeech.SUCCESS) {
                    promise.resolve(filePath);
                } else {
                    promise.reject("synthesis_error", "Failed to synthesize speech to file");
                }
            }
        } catch (Exception e) {
            promise.reject("synthesis_error", "Error synthesizing speech to file: " + e.getMessage());
        }
    }
    
    private void setLanguage(String languageCode) {
        if (!isInitialized) {
            return;
        }
        
        try {
            Locale locale;
            String[] parts = languageCode.split("-");
            
            if (parts.length > 1) {
                locale = new Locale(parts[0], parts[1]);
            } else {
                locale = new Locale(parts[0]);
            }
            
            int result = textToSpeech.setLanguage(locale);
            
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e(TAG, "Language " + languageCode + " is not supported");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting language: " + e.getMessage());
        }
    }
    
    private void setVoice(String voiceId) {
        if (!isInitialized || Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            return;
        }
        
        try {
            Set<Voice> voices = textToSpeech.getVoices();
            
            for (Voice voice : voices) {
                if (voice.getName().equals(voiceId)) {
                    textToSpeech.setVoice(voice);
                    return;
                }
            }
            
            Log.e(TAG, "Voice " + voiceId + " not found");
        } catch (Exception e) {
            Log.e(TAG, "Error setting voice: " + e.getMessage());
        }
    }
    
    private void setVoiceByGender(String gender) {
        if (!isInitialized || Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            return;
        }
        
        try {
            Set<Voice> voices = textToSpeech.getVoices();
            List<Voice> matchingVoices = new ArrayList<>();
            
            // Get current language
            Locale currentLocale = textToSpeech.getDefaultVoice().getLocale();
            
            // Find voices matching the current language and gender
            for (Voice voice : voices) {
                if (voice.getLocale().getLanguage().equals(currentLocale.getLanguage())) {
                    String voiceName = voice.getName().toLowerCase();
                    
                    if (gender.equals(GENDER_FEMALE) && 
                        (voiceName.contains("female") || voiceName.contains("woman") || voiceName.contains("girl"))) {
                        matchingVoices.add(voice);
                    } else if (gender.equals(GENDER_MALE) && 
                               (voiceName.contains("male") || voiceName.contains("man") || voiceName.contains("boy"))) {
                        matchingVoices.add(voice);
                    } else if (gender.equals(GENDER_NEUTRAL) && 
                               !voiceName.contains("female") && !voiceName.contains("woman") && 
                               !voiceName.contains("girl") && !voiceName.contains("male") && 
                               !voiceName.contains("man") && !voiceName.contains("boy")) {
                        matchingVoices.add(voice);
                    }
                }
            }
            
            // Use the first matching voice, or default if none found
            if (!matchingVoices.isEmpty()) {
                textToSpeech.setVoice(matchingVoices.get(0));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting voice by gender: " + e.getMessage());
        }
    }
    
    private void applyUtteranceOptions(ReadableMap options) {
        if (options.hasKey("languageCode")) {
            setLanguage(options.getString("languageCode"));
        }
        
        if (options.hasKey("voiceId")) {
            setVoice(options.getString("voiceId"));
        } else if (options.hasKey("voiceGender")) {
            setVoiceByGender(options.getString("voiceGender"));
        }
        
        if (options.hasKey("rate")) {
            textToSpeech.setSpeechRate((float) options.getDouble("rate"));
        }
        
        if (options.hasKey("pitch")) {
            textToSpeech.setPitch((float) options.getDouble("pitch"));
        }
        
        if (options.hasKey("volume")) {
            volume = (float) options.getDouble("volume");
        }
        
        if (options.hasKey("useSsml")) {
            useSsml = options.getBoolean("useSsml");
        }
        
        if (options.hasKey("audioDucking")) {
            audioDucking = options.getBoolean("audioDucking");
        }
    }
    
    private void requestAudioFocus() {
        if (!audioDucking) {
            return;
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                    .setAudioAttributes(audioAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener(focusChange -> {})
                    .build();
            
            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            audioManager.requestAudioFocus(
                    focusChange -> {},
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            );
        }
        
        // Save original volume and set to max if needed
        if (volume >= 1.0f) {
            originalStreamVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            audioManager.setStreamVolume(
                    AudioManager.STREAM_MUSIC,
                    audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC),
                    0
            );
        }
    }
    
    private void abandonAudioFocus() {
        if (!audioDucking) {
            return;
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (audioFocusRequest != null) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
                audioFocusRequest = null;
            }
        } else {
            audioManager.abandonAudioFocus(focusChange -> {});
        }
        
        // Restore original volume if needed
        if (originalStreamVolume != -1) {
            audioManager.setStreamVolume(
                    AudioManager.STREAM_MUSIC,
                    originalStreamVolume,
                    0
            );
            originalStreamVolume = -1;
        }
    }
    
    private void sendStateChangeEvent(String state) {
        sendEvent("onTtsStateChange", state);
    }
    
    private void sendEvent(String eventName, @Nullable Object params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
    
    @Override
    public void onCatalystInstanceDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        
        abandonAudioFocus();
        super.onCatalystInstanceDestroy();
    }
}