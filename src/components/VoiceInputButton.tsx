import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  language?: string; // e.g. 'en-US' or 'rw-RW'
  className?: string;
  tooltipText?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ 
  onTranscript, 
  language = 'en-US', 
  className = '',
  tooltipText = 'Dictate'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };

    setRecognition(rec);
  }, [language, onTranscript]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!supported || !recognition) {
      alert('Speech-to-text is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-1.5 rounded-lg transition-all focus:outline-none flex items-center justify-center shrink-0 ${
        isListening 
          ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300' 
          : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 shadow-sm'
      } ${className}`}
      title={isListening ? 'Listening... click to stop' : tooltipText}
    >
      {isListening ? (
        <MicOff className="w-3.5 h-3.5" />
      ) : (
        <Mic className="w-3.5 h-3.5" />
      )}
    </button>
  );
};
