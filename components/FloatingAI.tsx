"use client";
import {FormEvent,useEffect,useRef,useState} from "react";
export default function FloatingAI(){
 const [open,setOpen]=useState(false),[q,setQ]=useState(""),[reply,setReply]=useState(""),[busy,setBusy]=useState(false);
 const ref=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(open)setTimeout(()=>ref.current?.focus(),140)},[open]);
 async function ask(e:FormEvent){e.preventDefault();if(!q.trim()||busy)return;setBusy(true);setReply("");try{const r=await fetch("/api/site-assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q})});const p=await r.json();setReply(p.reply||p.error||"暂时无法回答。")}catch{setReply("AI 服务暂时不可用。")}finally{setBusy(false)}}
 return <>
 <button aria-label="星玥阳 AI 顾问" onClick={()=>setOpen(true)} className="xy-ai-orb">
   <span className="xy-ai-orb-dot">AI</span><span className="xy-ai-orb-label">智能顾问</span>
 </button>
 <div className={`xy-ai-backdrop ${open?"is-open":""}`} onMouseDown={()=>setOpen(false)}>
  <section className={`xy-ai-modal ${open?"is-open":""}`} onMouseDown={e=>e.stopPropagation()}>
   <header className="xy-ai-head"><div><span className="xy-kicker">XINGYUEYANG AI</span><h2>工业智能顾问</h2><p>产品选型、行业应用、在线检测与系统连接。</p></div><button onClick={()=>setOpen(false)} aria-label="关闭">×</button></header>
   <div className="xy-ai-suggestions"><button onClick={()=>setQ("请介绍适合煤电行业的在线监测产品")}>煤电在线监测</button><button onClick={()=>setQ("NC-300 可以解决什么问题？")}>NC-300</button><button onClick={()=>setQ("你们如何与 MES 系统连接？")}>MES 接口</button></div>
   {reply&&<div className="xy-ai-reply">{reply}</div>}
   <form onSubmit={ask} className="xy-ai-form"><textarea ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="输入你的技术或产品问题…"/><button disabled={busy}>{busy?"分析中":"发送"}</button></form>
  </section>
 </div>
 </>;
}
