import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  PermissionsAndroid,
  Platform,
  Text,
  View,
} from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import ReactNativeBlobUtil from "react-native-blob-util";
import TrackPlayer from "react-native-track-player";
import RNFetchBlob from "rn-fetch-blob";

const GROQ_API_KEY = "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";
const CARTESIA_API_KEY = "sk_car_88Lezk5pxk2HLfeZoZXnfC";
const audioRecorderPlayer = new AudioRecorderPlayer();

interface VoiceAssistantProps {
  groq_api_key: string;
  cartesia_api_key: string;
}

export function VoiceAssistant({
  cartesia_api_key,
  groq_api_key,
}: VoiceAssistantProps) {
  console.log(cartesia_api_key, groq_api_key);

  // const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  // const [filePath, setFilePath] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    TrackPlayer.setupPlayer();
  }, []);

  // Request microphone permission on Android
  const requestPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          grants[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("Permissions granted");
          return true;
        } else {
          console.log("All required permissions not granted");
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  // Start recording
  const onStartRecord = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener((e) => {
      // You can update UI with e.current_position
      return;
    });
    // setFilePath(result);
    setRecording(true);
  };

  // Stop recording and send to Groq
  const onStopRecord = async () => {
    setIsLoading(true);
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecording(false);
    // setFilePath(result);

    try {
      const res = await ReactNativeBlobUtil.fetch(
        "POST",
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
        [
          {
            name: "model",
            data: "whisper-large-v3",
          },
          {
            name: "file",
            filename: "sound.m4a",
            type: "audio/m4a",
            data: ReactNativeBlobUtil.wrap(result.replace("file://", "")),
          },
        ]
      );
      const transcribedText = JSON.parse(res.data).text;
      console.log("🚀 ~ onStopRecord ~ transcribedText:", transcribedText);
      const llmResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful voice assistant. Respond concisely and accurately.",
            },
            {
              role: "user",
              content: transcribedText,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const assistantResponse = llmResponse.data.choices[0].message.content;
      console.log("🚀 ~ onStopRecord ~ assistantResponse:", assistantResponse);

      const tempFilePath = `${RNFetchBlob.fs.dirs.CacheDir}/audio.mp3`;

      try {
        // Make the POST request and save the response to a file
        const ttsRes = await RNFetchBlob.config({
          path: tempFilePath, // Save the file here
        }).fetch(
          "POST",
          "https://api.cartesia.ai/tts/bytes",
          {
            Authorization: `Bearer ${CARTESIA_API_KEY}`,
            "Content-Type": "application/json",
            "Cartesia-Version": "2025-04-16",
          },
          JSON.stringify({
            model_id: "sonic-2",
            transcript: assistantResponse, // Ensure this is defined
            voice: {
              mode: "id",
              id: "694f9389-aac1-45b6-b726-9d9369183238",
            },
            output_format: {
              container: "mp3",
              bit_rate: 128000,
              sample_rate: 44100,
            },
            language: "en",
          })
        );

        // Check if the request was successful
        if (ttsRes.info().status === 200) {
          console.log("File saved to", ttsRes.path());

          // Add the local file to the player
          await TrackPlayer.add({
            id: "track1", // Unique ID for the track
            url: `file://${ttsRes.path()}`, // Local file URI
            title: "My Audio",
            artist: "Unknown",
          });

          // Start playback
          await TrackPlayer.play();
          console.log("Audio is playing");
        } else {
          throw new Error(
            `API request failed with status ${ttsRes.info().status}`
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {isLoading && <ActivityIndicator />}
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? onStopRecord : onStartRecord}
      />
      {/* <Button
        title="Play audio"
        onPress={() => {
          audioRecorderPlayer.startPlayer(
            'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
          );
        }}
      /> */}
      {/* {transcript.length > 0 && (
        <View style={{marginTop: 20, padding: 10}}>
          <Text style={{fontWeight: 'bold'}}>Transcript:</Text>
          <Text>{transcript}</Text>
        </View>
      )} */}
    </View>
  );
}
