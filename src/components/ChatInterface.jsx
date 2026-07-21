const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from 'react';

import { Send, Loader2, Plus, Mic, Square, Volume2, VolumeX, Radio, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { speak, stopSpeaking } from '@/lib/tts';
import { useWakeWord } from '@/lib/useWakeWord';
import { getPersonality, getName, getPersonalitySlang, slangToInstruction } from '@/lib/voiceSettings';
import { Button } from '@/components/ui/button';
import MessageBubble from './MessageBubble';
import ProcessingIndicator from './ProcessingIndicator';

const AGENT_NAME = 'namakshar';

export default function ChatInterface() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [wakeWord, setWakeWord] = useState(false);
  const [wakeStatus, setWakeStatus] = useState('idle');
  const [hiddenIds, setHiddenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('namakshar_hidden_conversations') || '[]')); } catch { return new Set(); }
  });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {if (e.data.size > 0) audioChunksRef.current.push(e.data);};
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const { file_url } = await db.integrations.Core.UploadFile({ file: audioFile });
          const transcript = await db.integrations.Core.TranscribeAudio({ audio_url: file_url });
          const text = (transcript || '').trim();
          if (text) setInput((prev) => (prev ? prev + ' ' : '') + text);
        } catch (e) {console.error('Transcription failed', e);}
        setTranscribing(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (e) {console.error('Mic access denied', e);}
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const toggleRecording = () => {recording ? stopRecording() : startRecording();};

  const quickCommands = [
    { label: 'Time', cmd: 'time' },
    { label: 'Date', cmd: 'date' },
    { label: 'Weather', cmd: 'weather' },
    { label: 'News', cmd: 'news' },
    { label: 'Joke', cmd: 'joke' },
    { label: 'Motivate', cmd: 'motivate' },
    { label: 'Translate', cmd: 'translate' },
    { label: 'Summarize', cmd: 'summarize' },
    { label: 'Calculator', cmd: 'calculator' },
    { label: 'Add task', cmd: 'addtask' },
    { label: 'Reminder', cmd: 'reminder' },
    { label: 'Note', cmd: 'note' },
    { label: 'YouTube', cmd: 'youtube' },
    { label: 'WhatsApp', cmd: 'whatsapp' },
    { label: 'Google', cmd: 'google' },
    { label: 'Maps', cmd: 'maps' },
    { label: 'Gmail', cmd: 'gmail' },
    { label: 'Calendar', cmd: 'calendar' },
    { label: 'Music', cmd: 'music' },
    { label: 'Coin', cmd: 'coin' },
    { label: 'Dice', cmd: 'dice' },
    { label: 'Fact', cmd: 'fact' },
    { label: 'Define', cmd: 'define' },
    { label: 'Clear', cmd: 'clear' },
    { label: 'Summary', cmd: 'summary' },
  ];

  const handleQuickCommand = (cmd) => {
    if (cmd === 'time') {const t = `It's ${new Date().toLocaleTimeString()}`;toast(t);speak(t);return;}
    if (cmd === 'date') {const d = `Today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;toast(d);speak(d);return;}
    if (cmd === 'youtube') {window.open('https://youtube.com', '_blank');return;}
    if (cmd === 'whatsapp') {window.open('https://web.whatsapp.com', '_blank');return;}
    if (cmd === 'google') {window.open('https://google.com', '_blank');return;}
    if (cmd === 'maps') {window.open('https://maps.google.com', '_blank');return;}
    if (cmd === 'gmail') {window.open('https://mail.google.com', '_blank');return;}
    if (cmd === 'calendar') {window.open('https://calendar.google.com', '_blank');return;}
    if (cmd === 'music') {window.open('https://music.youtube.com', '_blank');return;}
    if (cmd === 'weather') {sendMessage("What's the weather like today?");return;}
    if (cmd === 'news') {sendMessage("Give me today's top news headlines");return;}
    if (cmd === 'motivate') {sendMessage('Give me a quick motivational quote');return;}
    if (cmd === 'translate') {sendMessage('Help me translate some text');return;}
    if (cmd === 'summarize') {sendMessage('Summarize the following text for me');return;}
    if (cmd === 'calculator') {sendMessage('Help me with a calculation');return;}
    if (cmd === 'joke') {sendMessage('Tell me a short joke');return;}
    if (cmd === 'addtask') {sendMessage('Add a new task for me');return;}
    if (cmd === 'reminder') {sendMessage('Set a reminder for me');return;}
    if (cmd === 'note') {sendMessage('Add a note for me');return;}
    if (cmd === 'coin') {const r = Math.random() < 0.5 ? 'Heads' : 'Tails';toast(r);speak(r);return;}
    if (cmd === 'dice') {const r = `You rolled a ${Math.floor(Math.random() * 6) + 1}`;toast(r);speak(r);return;}
    if (cmd === 'fact') {sendMessage('Tell me a surprising fun fact');return;}
    if (cmd === 'define') {sendMessage('Define the word for me');return;}
    if (cmd === 'clear') {clearActiveChat();return;}
    if (cmd === 'summary') {sendMessage('Give me a daily summary of my tasks, reminders, and notes for today');return;}
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    const unsub = db.agents.subscribeToConversation(activeConvId, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub();
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!autoSpeak) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant' && last.content) speak(last.content);
  }, [messages, autoSpeak]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const convs = await db.agents.listConversations({ agent_name: AGENT_NAME });
      const visible = convs.filter((c) => !hiddenIds.has(c.id));
      setConversations(visible);
      if (visible.length > 0) {
        const latest = visible[0];
        setActiveConvId(latest.id);
        const full = await db.agents.getConversation(latest.id);
        setMessages(full.messages || []);
      }
    } catch (e) {toast.error('Failed to load conversations');}
    setLoading(false);
  };

  const createNewChat = async () => {
    try {
      const conv = await db.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: `Session ${conversations.length + 1}` }
      });
      setConversations((prev) => [conv, ...prev]);
      setActiveConvId(conv.id);
      setMessages([]);
    } catch (e) {toast.error('Failed to create chat');}
  };

  const switchConversation = async (id) => {
    setActiveConvId(id);
    try {
      const full = await db.agents.getConversation(id);
      setMessages(full.messages || []);
    } catch (e) {toast.error('Failed to open conversation');}
  };

  const deleteConversation = (id) => {
    const next = new Set(hiddenIds);
    next.add(id);
    setHiddenIds(next);
    try { localStorage.setItem('namakshar_hidden_conversations', JSON.stringify([...next])); } catch {}
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (id === activeConvId) {
      if (remaining.length > 0) switchConversation(remaining[0].id);
      else { setActiveConvId(null); setMessages([]); }
    }
    toast.success('Session removed');
  };

  const clearActiveChat = () => { if (activeConvId) deleteConversation(activeConvId); };

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    try {
      let convId = activeConvId;
      let conv;
      if (!convId) {
        conv = await db.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: text.slice(0, 40) }
        });
        convId = conv.id;
        setActiveConvId(convId);
        setConversations((prev) => [conv, ...prev]);
        const p = getPersonality();
        const slang = getPersonalitySlang(p.id);
        await db.agents.addMessage(conv, { role: 'user', content: `[PERSONALITY: Your name is ${getName()}. Adopt the personality of a ${p.label}. ${p.speechStyle} ${slangToInstruction(slang)} Stay in character for the entire conversation. Never break character.]` });
      } else {
        conv = await db.agents.getConversation(convId);
      }
      await db.agents.addMessage(conv, { role: 'user', content: text });
    } catch (e) {toast.error('Failed to send message');}
    setSending(false);
    inputRef.current?.focus();
  };

  useWakeWord(wakeWord, (cmd) => sendMessage(cmd), setWakeStatus);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>);

  }

  const visibleMessages = messages.filter((m) => !m.content?.startsWith('[PERSONALITY:'));
  const isStreaming = visibleMessages.length > 0 && visibleMessages[visibleMessages.length - 1]?.role === 'user';

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card/50 flex flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-border">
          <Button onClick={createNewChat} variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => (
            <div key={c.id} className={`group flex items-center gap-1 rounded-lg transition-colors ${c.id === activeConvId ? 'bg-primary/15' : 'hover:bg-secondary'}`}>
              <button onClick={() => switchConversation(c.id)}
                className={`flex-1 text-left px-3 py-2 rounded-lg text-sm truncate ${c.id === activeConvId ? 'text-primary' : 'text-muted-foreground'}`}>
                {c.metadata?.name || 'Untitled'}
              </button>
              <button onClick={() => deleteConversation(c.id)} title="Delete session"
                className="mr-1 p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile new chat */}
        <div className="md:hidden p-2 border-b border-border flex gap-2">
          <Button onClick={createNewChat} variant="outline" size="sm" className="gap-1 border-primary/30 text-primary">
            <Plus className="h-3 w-3" /> New
          </Button>
          <select value={activeConvId || ''} onChange={(e) => switchConversation(e.target.value)}
          className="flex-1 bg-secondary border border-border rounded-lg px-2 text-sm text-foreground">
            {conversations.map((c) => <option key={c.id} value={c.id}>{c.metadata?.name || 'Untitled'}</option>)}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 &&
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Good day, Boss. I am {getName()}</h2>
              <p className="text-muted-foreground text-sm max-w-md">Your attentive AI butler. I manage your tasks, reminders, and notes, answer questions, and anticipate your needs.</p>
              <p className="mt-3 text-xs text-primary/80 max-w-md">Tip: enable Wake word below, then say "hey Namakshar" followed by your request to go hands-free.</p>
            </div>
          }
          {visibleMessages.map((m, i) => <MessageBubble key={i} message={m} />)}
          {isStreaming && <ProcessingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 md:p-4 border-t border-border bg-card/30">
          <div className="max-w-3xl mx-auto mb-2 flex flex-wrap items-center gap-2">
            {quickCommands.map((q) =>
            <button key={q.cmd} onClick={() => handleQuickCommand(q.cmd)}
            className="px-3 py-1 rounded-full text-xs bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                {q.label}
              </button>
            )}
            <button onClick={() => setWakeWord((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-colors ${wakeWord ? 'bg-primary/15 text-primary border-primary/30' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
              <Radio className={`h-3 w-3 ${wakeWord && wakeStatus === 'listening' ? 'animate-pulse' : ''}`} /> {wakeWord ? (wakeStatus === 'listening' ? 'Listening…' : wakeStatus === 'denied' ? 'Mic blocked' : wakeStatus === 'unsupported' ? 'Unsupported' : 'Starting…') : 'Wake word'}
            </button>
            <button onClick={() => {setAutoSpeak((v) => !v);if (autoSpeak) stopSpeaking();}}
            className={`ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-colors ${autoSpeak ? 'bg-primary/15 text-primary border-primary/30' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
              {autoSpeak ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />} Auto-speak
            </button>
          </div>
          <form onSubmit={(e) => {e.preventDefault();sendMessage();}}
          className="flex gap-2 max-w-3xl mx-auto">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${getName()} anything...`}
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            disabled={sending} />
            <Button type="button" onClick={toggleRecording} disabled={transcribing}
            className={`rounded-xl px-4 ${recording ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : 'bg-secondary border border-border text-foreground hover:bg-secondary/80'}`}
            title={recording ? 'Stop recording' : 'Voice input'}>
              {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" disabled={!input.trim() || sending}
            className="rounded-xl px-4 bg-primary hover:bg-primary/90">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>);

}