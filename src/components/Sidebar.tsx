import React, { useState } from 'react';
import { MessageSquare, Plus, MoreVertical, Trash2, Edit2, Upload, GripVertical } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Agent } from '../store/useStore';

export default function Sidebar() {
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation,
    deleteConversation,
    agents,
    updateAgent,
    deleteAgent,
    reorderAgents,
    isAdmin,
    createConversation
  } = useStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [draggedAgent, setDraggedAgent] = useState<string | null>(null);

  const handleNewChat = () => {
    createConversation('openai', 'gpt-4o');
  };

  const handleAgentClick = (agent: Agent) => {
    const conversationId = createConversation(agent.provider, 'gpt-4o');
    // Add system message with agent's prompt
    // This would be handled by the chat logic
  };

  const handleRenameAgent = (agentId: string) => {
    if (editName.trim()) {
      updateAgent(agentId, { name: editName.trim() });
      setEditingAgent(null);
      setEditName('');
      setActiveMenu(null);
    }
  };

  const handleIconUpload = (agentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateAgent(agentId, { icon: event.target?.result as string });
        setActiveMenu(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (agentId: string) => {
    setDraggedAgent(agentId);
  };

  const handleDragOver = (e: React.DragEvent, targetAgentId: string) => {
    e.preventDefault();
    if (!draggedAgent || draggedAgent === targetAgentId) return;

    const draggedIndex = agents.findIndex(a => a.id === draggedAgent);
    const targetIndex = agents.findIndex(a => a.id === targetAgentId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newAgents = [...agents];
    const [removed] = newAgents.splice(draggedIndex, 1);
    newAgents.splice(targetIndex, 0, removed);

    reorderAgents(newAgents.map(a => a.id));
  };

  const handleDragEnd = () => {
    setDraggedAgent(null);
  };

  // Close menu on ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setEditingAgent(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const sortedAgents = [...agents].sort((a, b) => a.order - b.order);

  return (
    <aside className="w-80 border-r border-black/5 bg-white/70 backdrop-blur-md flex flex-col h-screen">
      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
               style={{ 
                 backgroundColor: 'var(--yellow-bg)', 
                 color: 'var(--yellow-text)',
                 border: '1px solid var(--yellow-border)'
               }}>
            Histórico do chat
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg hover:bg-brand-100/50 transition-all duration-200 text-brand-600 hover:scale-105"
            title="Nova conversa"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                currentConversation?.id === conv.id
                  ? 'bg-brand-100 shadow-md'
                  : 'hover:bg-white/80 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare size={18} className="text-brand-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-brand-900 truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Agents Section */}
      <div className="border-t border-black/5 p-4">
        <h3 className="text-sm font-semibold text-brand-700 mb-3">Agentes</h3>
        
        <div className="space-y-2">
          {sortedAgents.map(agent => (
            <div
              key={agent.id}
              draggable
              onDragStart={() => handleDragStart(agent.id)}
              onDragOver={(e) => handleDragOver(e, agent.id)}
              onDragEnd={handleDragEnd}
              className={`relative group ${draggedAgent === agent.id ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => handleAgentClick(agent)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/80 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex-shrink-0">
                  {agent.icon.startsWith('data:') ? (
                    <img 
                      src={agent.icon} 
                      alt={agent.name}
                      className="w-8 h-8 rounded-full object-cover bg-white/70 backdrop-blur-sm shadow-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm shadow-md flex items-center justify-center text-lg">
                      {agent.icon}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  {editingAgent === agent.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRenameAgent(agent.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameAgent(agent.id);
                        if (e.key === 'Escape') {
                          setEditingAgent(null);
                          setEditName('');
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 text-sm font-medium bg-white rounded border border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-medium text-brand-900 truncate">
                      {agent.name}
                    </p>
                  )}
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-xs bg-brand-100 text-brand-700 rounded-full">
                    {agent.provider}
                  </span>
                </div>

                <GripVertical size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === agent.id ? null : agent.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-brand-50 rounded-lg transition-all"
                  >
                    <MoreVertical size={16} className="text-brand-600" />
                  </button>
                )}
              </button>

              {activeMenu === agent.id && isAdmin && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-black/5 py-1 min-w-[160px] z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setEditingAgent(agent.id);
                      setEditName(agent.name);
                      setActiveMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-brand-50 flex items-center gap-2 text-brand-700"
                  >
                    <Edit2 size={14} />
                    Renomear
                  </button>
                  
                  <label className="w-full px-4 py-2 text-left text-sm hover:bg-brand-50 flex items-center gap-2 text-brand-700 cursor-pointer">
                    <Upload size={14} />
                    Trocar ícone
                    <input
                      type="file"
                      accept="image/png,image/svg+xml"
                      onChange={(e) => handleIconUpload(agent.id, e)}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={() => {
                      deleteAgent(agent.id);
                      setActiveMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
