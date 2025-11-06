import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  provider: 'openai' | 'gemini' | 'grok' | 'anthropic' | 'deepseek';
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface Agent {
  id: string;
  name: string;
  icon: string;
  provider: 'openai' | 'gemini' | 'grok' | 'anthropic' | 'deepseek';
  systemPrompt: string;
  order: number;
}

interface AppState {
  // User & Auth
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  
  // Logo
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
  
  // Conversations
  conversations: Conversation[];
  currentConversation: Conversation | null;
  setCurrentConversation: (id: string | null) => void;
  createConversation: (provider: 'openai' | 'gemini' | 'grok' | 'anthropic' | 'deepseek', model: string) => string;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  
  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Omit<Agent, 'id' | 'order'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  reorderAgents: (agentIds: string[]) => void;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Initialization
  initializeApp: () => void;
}

const defaultAgents: Agent[] = [
  {
    id: 'general-assistant',
    name: 'Assistente Geral',
    icon: '🤖',
    provider: 'openai',
    systemPrompt: 'Você é um assistente útil e prestativo.',
    order: 0
  },
  {
    id: 'code-expert',
    name: 'Especialista em Código',
    icon: '💻',
    provider: 'openai',
    systemPrompt: 'Você é um especialista em programação e desenvolvimento de software.',
    order: 1
  },
  {
    id: 'creative-writer',
    name: 'Escritor Criativo',
    icon: '✍️',
    provider: 'gemini',
    systemPrompt: 'Você é um escritor criativo especializado em conteúdo envolvente.',
    order: 2
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAdmin: true, // Default to admin for demo
      customLogo: null,
      conversations: [],
      currentConversation: null,
      agents: defaultAgents,
      sidebarOpen: true,
      
      // Actions
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      
      setCustomLogo: (logo) => set({ customLogo: logo }),
      
      setCurrentConversation: (id) => {
        const conversations = get().conversations;
        const conversation = id ? conversations.find(c => c.id === id) : null;
        set({ currentConversation: conversation || null });
      },
      
      createConversation: (provider, model) => {
        const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newConversation: Conversation = {
          id,
          title: 'Nova Conversa',
          messages: [],
          provider,
          model,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set(state => ({
          conversations: [newConversation, ...state.conversations],
          currentConversation: newConversation
        }));
        
        return id;
      },
      
      deleteConversation: (id) => {
        set(state => {
          const conversations = state.conversations.filter(c => c.id !== id);
          const currentConversation = state.currentConversation?.id === id 
            ? null 
            : state.currentConversation;
          
          return { conversations, currentConversation };
        });
      },
      
      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        };
        
        set(state => {
          const conversations = state.conversations.map(conv => {
            if (conv.id === conversationId) {
              const updatedMessages = [...conv.messages, newMessage];
              const title = conv.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                : conv.title;
              
              return {
                ...conv,
                messages: updatedMessages,
                title,
                updatedAt: Date.now()
              };
            }
            return conv;
          });
          
          const currentConversation = state.currentConversation?.id === conversationId
            ? conversations.find(c => c.id === conversationId) || null
            : state.currentConversation;
          
          return { conversations, currentConversation };
        });
      },
      
      setAgents: (agents) => set({ agents }),
      
      addAgent: (agent) => {
        const id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const order = get().agents.length;
        set(state => ({
          agents: [...state.agents, { ...agent, id, order }]
        }));
      },
      
      updateAgent: (id, updates) => {
        set(state => ({
          agents: state.agents.map(agent => 
            agent.id === id ? { ...agent, ...updates } : agent
          )
        }));
      },
      
      deleteAgent: (id) => {
        set(state => ({
          agents: state.agents.filter(agent => agent.id !== id)
        }));
      },
      
      reorderAgents: (agentIds) => {
        set(state => {
          const agentsMap = new Map(state.agents.map(a => [a.id, a]));
          const reorderedAgents = agentIds
            .map((id, index) => {
              const agent = agentsMap.get(id);
              return agent ? { ...agent, order: index } : null;
            })
            .filter(Boolean) as Agent[];
          
          return { agents: reorderedAgents };
        });
        
        // Save to localStorage
        localStorage.setItem('agents_order_v1', JSON.stringify(agentIds));
      },
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      initializeApp: () => {
        // Load agent order from localStorage
        const savedOrder = localStorage.getItem('agents_order_v1');
        if (savedOrder) {
          try {
            const agentIds = JSON.parse(savedOrder);
            get().reorderAgents(agentIds);
          } catch (e) {
            console.error('Failed to load agent order:', e);
          }
        }
        
        // Create default conversation if none exists
        const { conversations, currentConversation } = get();
        if (conversations.length === 0 || !currentConversation) {
          get().createConversation('openai', 'gpt-4o');
        }
      }
    }),
    {
      name: 'hdstec-ai-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        agents: state.agents,
        customLogo: state.customLogo,
        isAdmin: state.isAdmin
      })
    }
  )
);
