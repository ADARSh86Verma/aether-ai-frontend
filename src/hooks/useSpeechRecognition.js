import { useEffect, useRef, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.31.31:8000";

export default function useSpeechRecognition() {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const onTextRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const hasMediaRecorder =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window !== "undefined" &&
      "MediaRecorder" in window;

    setSupported(hasMediaRecorder);

    if (!hasMediaRecorder) {
      setError("Microphone recording is not supported in this browser.");
    }

    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // already stopped
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  const startListening = async (onText) => {
    setError("");

    if (!supported) {
      setError("Microphone recording is not supported.");
      return;
    }

    if (listening || processing) {
      return;
    }

    onTextRef.current = onText;
    chunksRef.current = [];

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      streamRef.current = stream;

      let mimeType = "";

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        console.log("[Voice] Recording started");
        setListening(true);
      };

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("[Voice] Recorder error:", event.error);
        setError("Microphone recording failed.");
        setListening(false);
        setProcessing(false);
      };

      recorder.onstop = async () => {
        console.log("[Voice] Recording stopped");

        setListening(false);

        streamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;

        const actualMimeType =
          recorder.mimeType || mimeType || "audio/webm";

        const blob = new Blob(chunksRef.current, {
          type: actualMimeType,
        });

        chunksRef.current = [];

        if (!blob.size) {
          setError("No audio was recorded.");
          return;
        }

        await transcribe(blob, actualMimeType);
      };

      recorder.start(250);
    } catch (err) {
      console.error("[Voice] Microphone error:", err);

      setListening(false);

      if (err?.name === "NotAllowedError") {
        setError(
          "Microphone permission was denied. Allow microphone access and try again."
        );
      } else if (err?.name === "NotFoundError") {
        setError("No microphone was found on this device.");
      } else if (err?.name === "NotReadableError") {
        setError("The microphone is already being used by another app.");
      } else {
        setError(
          err?.message || "Unable to access the microphone."
        );
      }
    }
  };

  const stopListening = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      return;
    }

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const transcribe = async (blob, mimeType) => {
    setProcessing(true);
    setError("");

    try {
      let extension = "webm";

      if (mimeType.includes("mp4")) {
        extension = "mp4";
      } else if (mimeType.includes("ogg")) {
        extension = "ogg";
      } else if (mimeType.includes("wav")) {
        extension = "wav";
      }

      const formData = new FormData();

      // IMPORTANT:
      // Backend expects UploadFile parameter named "file".
      formData.append(
        "file",
        blob,
        `voice.${extension}`
      );

      console.log("[Voice] Uploading audio:", {
        size: blob.size,
        type: blob.type,
        extension,
      });

      const response = await fetch(
        `${API_URL}/voice/transcribe`,
        {
          method: "POST",
          body: formData,
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = {
          detail: text,
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Voice transcription failed (${response.status})`
        );
      }

      const transcript =
        data?.text ||
        data?.transcript ||
        "";

      console.log(
        "[Voice] Transcript:",
        transcript
      );

      if (!transcript.trim()) {
        setError("No speech was detected.");
        return;
      }

      onTextRef.current?.(transcript.trim());
    } catch (err) {
      console.error(
        "[Voice] Transcription error:",
        err
      );

      setError(
        err?.message ||
          "Unable to transcribe the audio."
      );
    } finally {
      setProcessing(false);
    }
  };

  return {
    listening,
    processing,
    supported,
    error,
    startListening,
    stopListening,
  };
}