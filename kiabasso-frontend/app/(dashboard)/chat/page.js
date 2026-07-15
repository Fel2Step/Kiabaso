'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../../components/shared/Header';
import { useAuth } from '../../../hooks/useAuth';
import { useSocket } from '../../../hooks/useSocket';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/utils';

function ChatContent() {
  const searchParams = useSearchParams();
  const { user, wallet, refreshProfile } = useAuth();
  const { connectChat } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeAd, setActiveAd] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const initialUserId = searchParams.get('userId');
  const initialAdId = searchParams.get('adId');

  useEffect(() => { refreshProfile(); loadConversations(); }, []);

  useEffect(() => {
    if (initialUserId && initialAdId && user) {
      setActiveChat({ user_id: initialUserId, ad_id: initialAdId });
    }
  }, [initialUserId, initialAdId, user]);

  useEffect(() => {
    if (activeChat && user) {
      loadMessages();
      loadAdInfo(activeChat.ad_id);
      const socket = connectChat();
      if (socket) {
        socketRef.current = socket;
        socket.emit('join_ad_chat', { adId: activeChat.ad_id });

        socket.on('new_message', (data) => {
          if (data.ad_id === activeChat.ad_id &&
              ((data.sender_id === user.id && data.receiver_id === activeChat.user_id) ||
               (data.sender_id === activeChat.user_id && data.receiver_id === user.id))) {
            setMessages(prev => [...prev, data]);
          }
          loadConversations();
        });

        return () => {
          socket.emit('leave_ad_chat', { adId: activeChat.ad_id });
          socket.off('new_message');
        };
      }
    }
  }, [activeChat?.ad_id, activeChat?.user_id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    try {
      const res = await api.get('/chat/conversations');
      if (res.success) setConversations(res.data || []);
    } catch (err) { console.error('[Chat] Erro ao carregar conversas:', err); } finally { setLoading(false); }
  }

  async function loadAdInfo(adId) {
    try {
      const res = await api.get(`/ads/${adId}`);
      if (res.success) setActiveAd(res.data);
    } catch (err) { console.error('[Chat] Erro ao carregar anúncio:', err); }
  }

  async function loadMessages() {
    try {
      const res = await api.get(`/chat/${activeChat.ad_id}/${activeChat.user_id}`);
      if (res.success) setMessages(res.data || []);
    } catch (err) { console.error('[Chat] Erro ao carregar mensagens:', err); }
  }

  async function handleSend() {
    if (!newMessage.trim() || !activeChat || !socketRef.current) return;

    const messageData = {
      adId: activeChat.ad_id,
      receiverId: activeChat.user_id,
      content: newMessage.trim(),
      messageType: 'text',
    };

    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (socketRef.current && activeChat) {
      socketRef.current.emit('typing', {
        adId: activeChat.ad_id,
        receiverId: activeChat.user_id,
        isTyping: true,
      });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', {
          adId: activeChat.ad_id,
          receiverId: activeChat.user_id,
          isTyping: false,
        });
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header user={user} wallet={wallet} />
      <div className="h-[calc(100vh-4rem)] flex">
        <div className={`w-full md:w-80 border-r border-gray-100 bg-white flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg">💬 Mensagens</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm">Carregando...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">Nenhuma conversa</div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat({ user_id: conv.other_user_id, ad_id: conv.ad_id })}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                    activeChat?.ad_id === conv.ad_id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {conv.other_user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{conv.other_user_name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(conv.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.content}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{conv.ad_title}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col bg-white ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <button className="md:hidden btn-ghost p-1" onClick={() => setActiveChat(null)}>←</button>
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {conversations.find(c => c.other_user_id === activeChat.user_id)?.other_user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {conversations.find(c => c.other_user_id === activeChat.user_id)?.other_user_name || 'Utilizador'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {conversations.find(c => c.ad_id === activeChat.ad_id)?.ad_title || 'Anúncio'}
                    </p>
                  </div>
                </div>

                {activeAd && (
                  <a
                    href={`/ad/${activeAd.id}`}
                    className="flex items-center gap-3 p-3 bg-primary-50 rounded-card hover:bg-primary-100 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {activeAd.images?.length > 0 ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${activeAd.images[0]}`}
                          alt={activeAd.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📱</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{activeAd.title}</p>
                      <p className="text-primary font-bold text-sm">{parseFloat(activeAd.price).toLocaleString()} Kz</p>
                      <p className="text-xs text-primary-600 font-medium">
                        🔒 Comprar com Proteção →
                      </p>
                    </div>
                  </a>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender_id === user.id
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-white/70' : 'text-gray-400'}`}>
                        {formatDate(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escreva sua mensagem..."
                    className="input-field flex-1 resize-none"
                    rows={1}
                  />
                  <button onClick={handleSend} disabled={!newMessage.trim()} className="btn-primary px-4">
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p>Seleccione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Carregando chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
