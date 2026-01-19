import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { Card } from '../common/Card';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const MessagingBox = ({ idEncadrement, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (idEncadrement) {
      loadMessages();
    }
  }, [idEncadrement]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/messages/${idEncadrement}`);

      if (response.data.success) {
        setMessages(response.data.data || []);
        // Marquer les messages comme lus
        await axios.put(`/messages/${idEncadrement}/mark-read`);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    try {
      setSending(true);
      const response = await axios.post(`/messages/${idEncadrement}`, {
        contenu: newMessage.trim()
      });

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage('');
        toast.success('Message envoyé');
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageDate = (date) => {
    try {
      return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return date;
    }
  };

  const isMyMessage = (message) => {
    return message.Expediteur_Id === currentUser.id;
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <span>Messagerie avec {currentUser.role === 'etudiant' ? 'votre encadreur' : 'l\'étudiant'}</span>
        </div>
      }
      className="h-[600px] flex flex-col"
    >
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucun message</p>
            <p className="text-sm">Commencez la conversation en envoyant un message</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.Id_Message}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isMyMessage(message)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.Contenu}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageDate(message.Date_Envoi)}
                    {isMyMessage(message) && message.Lu && ' • Lu'}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Envoyer</span>
            </>
          )}
        </button>
      </form>
    </Card>
  );
};
