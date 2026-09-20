import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Das Mikrofon ist blockiert. Bitte in den Browser-Einstellungen erlauben.",
  "service-not-allowed": "Das Mikrofon ist blockiert. Bitte in den Browser-Einstellungen erlauben.",
  "no-speech": "Ich habe nichts gehört – bitte noch einmal versuchen.",
  "audio-capture": "Kein Mikrofon gefunden.",
  network: "Keine Verbindung zum Spracherkennungs-Dienst.",
};

export function useSpeech(onText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantsRef = useRef(false);
  const callbackRef = useRef(onText);
  callbackRef.current = onText;

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      wantsRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  const stop = useCallback(() => {
    wantsRef.current = false;
    setListening(false);
    setInterim("");
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const begin = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "de-DE";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      let finalText = "";
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += text;
        else pending += text;
      }
      setInterim(pending.trim());
      if (finalText.trim()) {
        setInterim("");
        callbackRef.current(finalText.trim());
      }
    };
    recognition.onerror = (event: any) => {
      const code = event?.error as string | undefined;
      if (code === "aborted") return;
      if (code === "no-speech") return; // Neustart über onend
      wantsRef.current = false;
      setListening(false);
      setError(ERRORS[code ?? ""] ?? "Das Diktieren hat nicht geklappt – bitte tippen.");
    };
    recognition.onend = () => {
      setInterim("");
      if (wantsRef.current) {
        // Mobile Browser beenden die Erkennung nach kurzen Pausen automatisch.
        try {
          recognition.start();
          return;
        } catch {
          wantsRef.current = false;
        }
      }
      setListening(false);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      wantsRef.current = true;
      setListening(true);
      setError(null);
    } catch {
      setError("Das Diktieren konnte nicht gestartet werden – bitte tippen.");
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!getRecognitionCtor()) {
      setError("Dieses Gerät unterstützt kein Diktieren – bitte tippen.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
      stream?.getTracks().forEach((t) => t.stop());
    } catch {
      setError("Das Mikrofon ist blockiert. Bitte in den Browser-Einstellungen erlauben.");
      return;
    }
    begin();
  }, [begin]);

  return { supported, listening, error, interim, start, stop };
}
