import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Bot, User } from 'lucide-react';

export default function ChatArea() {
  const { currentConversation } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot size={32} className="text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-900 mb-2">
            Bem-vindo ao HDSTEC AI
          </h2>
          <p className="text-gray-600">
            Comece uma conversa digitando uma mensagem abaixo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {currentConversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 animate-fade-in ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-brand-500 text-white' 
                : 'bg-white/70 backdrop-blur-sm shadow-md text-brand-600'
            }`}>
              {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] px-5 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'bg-white/70 backdrop-blur-sm shadow-md text-gray-900'
              }`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2 px-2">
                {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
