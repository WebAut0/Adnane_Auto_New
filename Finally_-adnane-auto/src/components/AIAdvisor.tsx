/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot, User } from 'lucide-react';

interface AIAdvisorProps {
  lang: 'ar' | 'fr';
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function AIAdvisor({ lang }: AIAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Set initial greeting based on selected language
  useEffect(() => {
    if (messages.length === 0) {
      if (lang === 'ar') {
        setMessages([
          {
            sender: 'bot',
            text: 'مرحباً بك في عدنان أوتو! أنا مستشارك الذكي للسيارات المستعملة في مراكش. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن اختيار سيارة مناسبة، أو تفاصيل خدمة الاستبدال (Reprise).'
          }
        ]);
      } else {
        setMessages([
          {
            sender: 'bot',
            text: 'Bonjour ! Bienvenue chez Adnane Auto. Je suis votre conseiller virtuel IA spécialisé en voitures d\'occasion à Marrakech. Comment puis-je vous guider aujourd\'hui ? Posez-moi vos questions sur nos véhicules ou notre service Reprise.'
          }
        ]);
      }
    }
  }, [lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json().catch(() => null);
      if (data && data.text) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.text }]);
      } else {
        const fallbackMsg = lang === 'ar'
          ? 'مرحباً بك! نحن في معرض عدنان أوتو بمراكش نوفر أفضل السيارات المستعملة وضمان الاستبدال (Reprise). اتصل بنا مباشرة على: +212 672 60 16 78.'
          : 'Bienvenue chez Adnane Auto Marrakech ! Nous proposons les meilleures voitures d\'occasion avec reprise. Contactez-nous au +212 672 60 16 78.';
        setMessages((prev) => [...prev, { sender: 'bot', text: fallbackMsg }]);
      }
    } catch (error) {
      console.error(error);
      const errorText = lang === 'ar' 
        ? 'عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى مراجعة الاتصال والاتصال المباشر بنا على الرقم +212 672 60 16 78.'
        : 'Désolé, une erreur est survenue lors de la communication. Veuillez réessayer ou nous contacter au +212 672 60 16 78.';
      setMessages((prev) => [...prev, { sender: 'bot', text: errorText }]);
    } finally {
      setLoading(false);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div id="ai-advisor" className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-1.5rem)]">
      {/* Chat window */}
      {isOpen && (
        <div 
          id="chat-window" 
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[calc(100vw-1.5rem)] sm:w-[380px] h-[calc(100vh-110px)] max-h-[500px] sm:h-[480px] flex flex-col mb-2.5 sm:mb-3 overflow-hidden transition-all duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm tracking-wide truncate">
                  {lang === 'ar' ? 'مستشار عدنان أوتو الذكي' : 'Conseiller Adnane Auto IA'}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-rose-100 truncate">
                  {lang === 'ar' ? 'متصل الآن للاستشارة المجانية' : 'En ligne - Conseil Automobile'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1.5 rounded-full transition shrink-0 cursor-pointer"
              title={lang === 'ar' ? 'إغلاق' : 'Fermer'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex items-start gap-2 max-w-[88%] ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`p-1.5 rounded-full shrink-0 ${
                    msg.sender === 'user' ? 'bg-rose-100 text-rose-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {msg.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>
                  <div 
                    className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-rose-500 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                    style={{ direction: isRtl ? 'rtl' : 'ltr' }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 max-w-[80%]">
                  <div className="p-1.5 rounded-full bg-gray-200 text-gray-600 shrink-0">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <div className="h-2 w-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2.5 sm:p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'ar' ? 'اكتب سؤالك هنا...' : 'Posez votre question...'}
              className="flex-1 bg-gray-100 border-none outline-none rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-1 focus:ring-rose-500 transition-all"
              disabled={loading}
              style={{ direction: isRtl ? 'rtl' : 'ltr' }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-2 sm:p-2.5 rounded-full shrink-0 ${
                input.trim() ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-gray-100 text-gray-400'
              } transition-colors duration-200 cursor-pointer`}
            >
              <Send className={`h-4 w-4 transform ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Bubble */}
      <button 
        id="advisor-bubble"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-xl rounded-full p-3 sm:p-4 flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse shrink-0" />
        <span className="font-bold text-xs sm:text-sm select-none pr-1">
          {lang === 'ar' ? 'استشارة ذكية' : 'Conseil IA'}
        </span>
      </button>
    </div>
  );
}
