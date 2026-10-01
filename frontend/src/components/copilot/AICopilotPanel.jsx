import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Send, X, Bot, Zap, PlayCircle
} from 'lucide-react';
import { getWelcomeMessage, processQuery } from '../../services/copilotService';

export default function AICopilotPanel({ selectedAirline = 'Air India' }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [context, setContext] = useState({});
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Load dynamic initial state from backend telemetry API on mount & airline change
  useEffect(() => {
    let isMounted = true;
    getWelcomeMessage(selectedAirline).then((welcomeMsg) => {
      if (isMounted) {
        setMessages([welcomeMsg]);
        if (welcomeMsg.contextUpdate) {
          setContext(welcomeMsg.contextUpdate);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedAirline]);

  // Quick Suggestion Chips matching key intent categories
  const quickPrompts = [
    'Why is this flight delayed?',
    'Show the biggest cascade risk',
    'How many passengers are affected?',
    'Which aircraft is affected?',
    'Which crew is assigned?',
    'Which gate is affected?',
    'Show the recovery plan',
    'What if aircraft is unavailable?',
    'Show network health'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isAnalyzing, isOpen]);

  // Handle send message calling data-driven copilot service
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isAnalyzing) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsAnalyzing(true);

    try {
      const aiResponse = await processQuery(query, context, selectedAirline);
      setMessages((prev) => [...prev, aiResponse]);
      if (aiResponse.contextUpdate) {
        setContext((prevCtx) => ({ ...prevCtx, ...aiResponse.contextUpdate }));
      }
    } catch (err) {
      console.error('[CopilotPanel] Analysis failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "I don't have enough operational data to answer that right now.",
          recommendation: null
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {/* 1. COLLAPSED FLOATING BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-20 z-40 px-4 py-3 rounded-2xl bg-slate-950/90 text-white border border-cyan-500/50 backdrop-blur-xl shadow-[0_8px_25px_rgba(6,182,212,0.3)] hover:scale-105 transition-all duration-200 flex items-center gap-3 font-label-code text-xs group"
          title="Open AIR-OPT AI Copilot Operational Decision Support"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-1.5 rounded-full bg-cyan-400/40 animate-ping"></span>
            <div className="w-7 h-7 rounded-xl bg-primary-container text-cyan-300 flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <div className="font-extrabold text-white flex items-center gap-1.5">
              <span>AIR-OPT AI Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[10px] text-cyan-300/80 font-medium">Operational Decision Support</span>
          </div>
        </button>
      )}

      {/* 2. EXPANDED AI COPILOT PANEL */}
      {isOpen && (
        <div className="fixed right-4 md:right-6 bottom-20 z-40 w-[calc(100vw-2rem)] sm:w-[400px] md:w-[420px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-white font-label-code overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-container text-cyan-300 flex items-center justify-center font-bold shadow-md">
                <Sparkles className="w-4.5 h-4.5 text-cyan-300" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>AIR-OPT AI Copilot</span>
                  <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                    ONLINE
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">Operational Decision Support • Human In Control</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Collapse Copilot Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Decision Support Banner */}
          <div className="bg-cyan-950/40 px-4 py-2 border-b border-cyan-500/20 text-[10px] text-cyan-300 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analyzing live network telemetry for <strong>{selectedAirline}</strong></span>
            </span>
            <span className="text-emerald-400 font-bold">API Connected</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-1 px-1">
                  {msg.sender === 'user' ? 'Airline Operator' : 'AIR-OPT AI Copilot'} • {msg.timestamp}
                </div>

                <div
                  className={`p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary-container text-white rounded-br-none max-w-[85%]'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none w-full space-y-3'
                  }`}
                >
                  {/* Text Content */}
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                  {/* Recommendation Structured Box if present */}
                  {msg.recommendation && (
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3 font-sans text-xs">
                      
                      <div className="font-bold text-cyan-300 flex items-center justify-between font-mono text-[11px]">
                        <span>{msg.recommendation.title}</span>
                        {msg.recommendation.confidence && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px]">
                            {msg.recommendation.confidence}
                          </span>
                        )}
                      </div>

                      {/* Recommended Recovery Actions */}
                      {msg.recommendation.actions && msg.recommendation.actions.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Telemetry Findings & Actions:</div>
                          <ul className="space-y-1 pl-1 text-slate-200 text-xs">
                            {msg.recommendation.actions.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="font-bold text-cyan-400 font-mono text-[11px]">{idx + 1}.</span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Estimated Impact Metrics */}
                      {msg.recommendation.impact && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                          {msg.recommendation.impact.map((imp, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                              <div className="text-[9px] text-slate-400 uppercase">{imp.label}</div>
                              <div className="font-bold text-cyan-300 mt-0.5">{imp.value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Why this recommendation */}
                      {msg.recommendation.explanation && (
                        <div className="pt-2 border-t border-slate-800 text-[11px]">
                          <div className="text-[10px] uppercase font-bold text-amber-400 font-mono mb-0.5">Decision Rationale:</div>
                          <div className="text-slate-300 leading-normal">{msg.recommendation.explanation}</div>
                        </div>
                      )}

                      {/* Impacted Resources Badge Footer */}
                      {(msg.recommendation.affectedPax !== undefined || msg.recommendation.affectedFlights) && (
                        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                          <span className="text-slate-400">Impact Scope:</span>
                          {msg.recommendation.affectedPax !== undefined && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                              {msg.recommendation.affectedPax} Pax
                            </span>
                          )}
                          {msg.recommendation.affectedFlights && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                              {msg.recommendation.affectedFlights.length} Flight Rotation(s)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Interactive Action Buttons */}
                      <div className="pt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/recovery');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Generate Plan</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/recovery-sandbox');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition-colors flex items-center justify-center gap-1 border border-cyan-500/30"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Simulate Impact</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            ))}

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-3 bg-slate-900/80 rounded-xl border border-slate-800 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                <span>AIR-OPT Neural Solver querying backend telemetry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-3 bg-slate-900/60 border-t border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2 font-mono text-[11px]">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                disabled={isAnalyzing}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 whitespace-nowrap border border-slate-700 transition-colors shrink-0 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box & Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask AIR-OPT AI Copilot decision support..."
              disabled={isAnalyzing}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs focus:outline-none focus:border-cyan-500 font-sans disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isAnalyzing}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold transition-colors shadow-sm"
              title="Send to AI Copilot"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Human Control Guarantee Footer */}
          <div className="px-4 py-1.5 bg-slate-950 text-[9px] text-slate-400 text-center font-mono border-t border-slate-900">
            ⚠️ DECISION-SUPPORT SYSTEM • Human Airline Operator Authorization Required
          </div>

        </div>
      )}
    </>
  );
}
