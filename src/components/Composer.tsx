import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { sendMessage } from '../services/aiService';

export default function Composer() {
  const { currentConversation, addMessage } = useStore();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setInput(prev => {
          const base = prev.replace(/\[Ouvindo...\]$/, '').trim();
          return finalTranscript ? base + ' ' + finalTranscript : base + ' ' + interimTranscript;
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // ESC to stop recording
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRecording) {
        stopRecording();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isRecording]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation || isSending) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    // Add user message
    addMessage(currentConversation.id, {
      role: 'user',
      content: userMessage
    });

    try {
      // Get AI response
      const response = await sendMessage(
        currentConversation.provider,
        currentConversation.model,
        [...currentConversation.messages, { 
          id: '', 
          role: 'user', 
          content: userMessage, 
          timestamp: Date.now() 
        }]
      );

      // Add assistant message
      addMessage(currentConversation.id, {
        role: 'assistant',
        content: response
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage(currentConversation.id, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, verifique suas credenciais nas configurações.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="border-t border-black/5 bg-white/70 backdrop-blur-md p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <button
            type="button"
            className="p-3 rounded-xl hover:bg-brand-100/50 transition-all duration-200 text-brand-600 hover:scale-105 flex-shrink-0"
            title="Anexar arquivo"
          >
            <Paperclip size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-black/10 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 outline-none resize-none bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isSpeechSupported}
              className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : isSpeechSupported
                  ? 'hover:bg-brand-100/50 text-brand-600 hover:scale-105'
                  : 'opacity-30 cursor-not-allowed text-gray-400'
              }`}
              title={
                !isSpeechSupported 
                  ? 'Reconhecimento de voz não suportado' 
                  : isRecording 
                  ? 'Parar gravação (ESC)' 
                  : 'Iniciar gravação'
              }
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg flex-shrink-0"
            title="Enviar mensagem"
          >
            <Send size={20} />
          </button>
        </div>

        {isRecording && (
          <p className="text-xs text-red-600 mt-2 text-center animate-pulse">
            🎤 Gravando... (pressione ESC para parar)
          </p>
        )}
      </form>
    </div>
  );
}
