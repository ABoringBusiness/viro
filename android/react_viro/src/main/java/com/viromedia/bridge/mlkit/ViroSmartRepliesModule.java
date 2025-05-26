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
import com.google.mlkit.nl.smartreply.SmartReply;
import com.google.mlkit.nl.smartreply.SmartReplyGenerator;
import com.google.mlkit.nl.smartreply.SmartReplySuggestion;
import com.google.mlkit.nl.smartreply.TextMessage;

import java.util.ArrayList;
import java.util.List;

public class ViroSmartRepliesModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ViroSmartRepliesModule";
    private final ReactApplicationContext reactContext;
    private SmartReplyGenerator smartReplyGenerator;

    public ViroSmartRepliesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.smartReplyGenerator = SmartReply.getClient();
    }

    @Override
    public String getName() {
        return "ViroSmartReplies";
    }

    @ReactMethod
    public void suggestReplies(ReadableArray conversation, Promise promise) {
        try {
            List<TextMessage> messages = new ArrayList<>();
            
            // Convert React Native conversation to ML Kit TextMessage objects
            for (int i = 0; i < conversation.size(); i++) {
                ReadableMap messageMap = conversation.getMap(i);
                String text = messageMap.getString("text");
                boolean isLocalUser = messageMap.getBoolean("isLocalUser");
                
                long timestamp = System.currentTimeMillis();
                if (messageMap.hasKey("timestamp")) {
                    timestamp = (long) messageMap.getDouble("timestamp");
                }
                
                TextMessage message;
                if (isLocalUser) {
                    message = TextMessage.createForLocalUser(text, timestamp);
                } else {
                    message = TextMessage.createForRemoteUser(text, timestamp, "remote-user");
                }
                
                messages.add(message);
            }
            
            // Generate smart replies
            smartReplyGenerator.suggestReplies(messages)
                    .addOnSuccessListener(new OnSuccessListener<SmartReplySuggestion[]>() {
                        @Override
                        public void onSuccess(SmartReplySuggestion[] suggestions) {
                            WritableArray results = Arguments.createArray();
                            
                            for (SmartReplySuggestion suggestion : suggestions) {
                                WritableMap suggestionMap = Arguments.createMap();
                                suggestionMap.putString("text", suggestion.getText());
                                results.pushMap(suggestionMap);
                            }
                            
                            promise.resolve(results);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("E_SMART_REPLIES", e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("E_SMART_REPLIES", e.getMessage(), e);
        }
    }
}