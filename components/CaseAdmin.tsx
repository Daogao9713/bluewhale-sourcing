"use client";import {FormEvent,useEffect,useState} from "react";export default function CaseAdmin(){const [rows,setRows]=useState<any[]>([]),[edit,setEdit]=useState<any>(null),[busy,setBusy]=useState(false),[err,setErr]=useState("");
async function api(path: string, init: RequestInit = {}) {
  const h = new Headers(init.headers);

  h.set(
    "x-admin-key",
    sessionStorage.getItem("bluewhale_admin_key") || ""
  );

  if (init.body && !(init.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }

  const r = await fetch(path, {
    ...init,
    headers: h,
    credentials: "same-origin",
    cache: "no-store",
  });

  const contentType = r.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await r.text();

    console.error("[CaseAdmin API]", {
      path,
      status: r.status,
      contentType,
      response: text.slice(0, 300),
    });

    throw new Error(
      `API ${path} 返回了非 JSON 响应（HTTP ${r.status}）`
    );
  }

  const p = await r.json();

  if (!r.ok) {
    throw new Error(p.error || `Request failed (${r.status})`);
  }

  return p;
}
async function load(){try{setRows((await api("/api/workspace/cases")).cases||[])}catch(e:any){setErr(e.message)}}useEffect(()=>{load()},[]);
async function upload(f:File){setBusy(true);try{const x=new FormData();x.append("file",f);x.append("folder","cases");const p=await api("/api/workspace/media",{method:"POST",body:x});setEdit((v:any)=>({...v,image_url:p.url}))}catch(e:any){setErr(e.message)}finally{setBusy(false)}}

async function save(e: FormEvent) {
  e.preventDefault();
  setBusy(true);

  try {
    await api("/api/workspace/cases", {
      method: edit.id ? "PATCH" : "POST",
      body: JSON.stringify(edit),
    });

    setEdit(null);
    await load();
  } catch (e: any) {
    setErr(e.message);
  } finally {
    setBusy(false);
  }
}

const blank={title:"",slug:"",industry:"",location:"",related_product:"",summary:"",content:"",image_url:"",featured:false,sort_order:0,status:"draft"};
return <section><div className="flex items-end justify-between"><div><p className="text-xs tracking-[.18em] text-amber-600">CASE CMS</p><h1 className="mt-2 text-3xl font-semibold">工程案例管理</h1><p className="mt-2 text-sm text-slate-500">案例图片、正文、行业、地区和关联设备均可在这里维护。</p></div><button onClick={()=>setEdit({...blank})} className="rounded-xl bg-slate-950 px-4 py-3 text-xs text-white">新增案例</button></div>{err&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">{err}</p>}{edit&&<form onSubmit={save} className="mt-6 grid gap-4 rounded-3xl border bg-white p-6 lg:grid-cols-2"><input className="field" required placeholder="案例标题" value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})}/><input className="field" placeholder="Slug（英文）" value={edit.slug} onChange={e=>setEdit({...edit,slug:e.target.value})}/><input className="field" placeholder="行业" value={edit.industry} onChange={e=>setEdit({...edit,industry:e.target.value})}/><input className="field" placeholder="地区" value={edit.location} onChange={e=>setEdit({...edit,location:e.target.value})}/><input className="field lg:col-span-2" placeholder="关联设备，例如 NC-300" value={edit.related_product} onChange={e=>setEdit({...edit,related_product:e.target.value})}/><textarea className="field min-h-24 lg:col-span-2" placeholder="摘要" value={edit.summary} onChange={e=>setEdit({...edit,summary:e.target.value})}/><textarea className="field min-h-40 lg:col-span-2" placeholder="案例正文" value={edit.content} onChange={e=>setEdit({...edit,content:e.target.value})}/><div>{edit.image_url?<img src={edit.image_url} className="h-52 w-full rounded-2xl object-cover" alt=""/>:<div className="grid h-52 place-items-center rounded-2xl bg-slate-50 text-sm text-slate-400">案例主图</div>}<label className="mt-3 block cursor-pointer rounded-xl border p-3 text-center text-xs">上传图片<input hidden type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></label></div><div className="grid content-start gap-4"><select className="field" value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}><option value="draft">草稿</option><option value="published">发布</option><option value="archived">归档</option></select><label className="text-sm"><input type="checkbox" checked={edit.featured} onChange={e=>setEdit({...edit,featured:e.target.checked})}/> 首页推荐</label><button disabled={busy} className="rounded-xl bg-amber-500 p-3 text-sm font-semibold">保存案例</button><button type="button" onClick={()=>setEdit(null)} className="text-sm text-slate-400">取消</button></div></form>}<div className="mt-6 grid gap-4 lg:grid-cols-3">{rows.map(c=><article key={c.id} className="overflow-hidden rounded-3xl border bg-white">{c.image_url?<img src={c.image_url} className="aspect-video w-full object-cover" alt=""/>:<div className="grid aspect-video place-items-center bg-slate-50 text-xs text-slate-400">暂无图片</div>}<div className="p-5"><div className="text-xs text-amber-600">{c.industry||"CASE"} · {c.status}</div><b className="mt-2 block">{c.title}</b><button onClick={()=>setEdit({...c})} className="mt-4 rounded-lg border px-3 py-2 text-xs">编辑</button></div></article>)}</div></section>}
