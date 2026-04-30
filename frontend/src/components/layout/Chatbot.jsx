import { useState, useRef, useEffect } from 'react'
import api from '../services/api'

const SUGGESTIONS = [
  "Best crop for Tamil Nadu in summer?",
  "How to fix dry soil condition?",
  "When to irrigate corn crops?",
  "How to identify pest attack on wheat?",
  "Best fertilizer for soybeans?",
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Agriculture AI Assistant. Ask me anything about crops, soil, irrigation, or farming!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    const userMsg = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    try {
      const { data } = await api.post('/chatbot/ask', {
        message: msg,
        history: messages.slice(-6)
      })
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, could not connect to AI. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position:'fixed', bottom:24, right:24, width:52, height:52,
        borderRadius:'50%', background:'#2a7a4b', color:'#fff',
        border:'none', cursor:'pointer', fontSize:22,
        boxShadow:'0 4px 16px rgba(42,122,75,0.35)', zIndex:1000
      }}>{open ? '✕' : '🌾'}</button>

      {/* Chat window */}
      {open && (
        <div style={{
          position:'fixed', bottom:88, right:24, width:'calc(100vw - 48px)', maxWidth:400, height:'calc(100vh - 120px)', maxHeight:600,
          background:'#fff', borderRadius:16, border:'1px solid #e5e7eb',
          boxShadow:'0 8px 32px rgba(0,0,0,0.12)', display:'flex',
          flexDirection:'column', zIndex:1000, overflow:'hidden'
        }}>
          {/* Header */}
          <div style={{background:'#2a7a4b', padding:'14px 16px', color:'#fff'}}>
            <div style={{fontWeight:600, fontSize:14}}>🌾 Agro AI Assistant</div>
            <div style={{fontSize:11, opacity:0.8, marginTop:2}}>Powered by LLaMA 3 · Ask anything about farming</div>
          </div>

          {/* Messages */}
          <div style={{flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8}}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth:'80%', padding:'8px 12px', borderRadius:10, fontSize:13,
                  lineHeight:1.5,
                  background: m.role === 'user' ? '#2a7a4b' : '#f3f4f6',
                  color: m.role === 'user' ? '#fff' : '#1f2937',
                  borderBottomRightRadius: m.role === 'user' ? 2 : 10,
                  borderBottomLeftRadius: m.role === 'assistant' ? 2 : 10,
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{display:'flex', gap:4, padding:'8px 12px', background:'#f3f4f6', borderRadius:10, alignSelf:'flex-start', width:'fit-content'}}>
                {[0,1,2].map(i => <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#9ca3af',animation:`bounce 1s ${i*0.2}s infinite`}}/>)}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={{padding:'0 10px 8px', display:'flex', gap:6, flexWrap:'wrap'}}>
              {SUGGESTIONS.slice(0,3).map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  fontSize:11, padding:'4px 8px', borderRadius:99,
                  border:'1px solid #d1fae5', background:'#f0fdf4',
                  color:'#166534', cursor:'pointer'
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{padding:'10px 12px', borderTop:'1px solid #f3f4f6', display:'flex', gap:8}}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about crops, soil, irrigation..."
              style={{flex:1, padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, outline:'none'}}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{
              padding:'8px 14px', background:'#2a7a4b', color:'#fff',
              border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500
            }}>Send</button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </>
  )
}