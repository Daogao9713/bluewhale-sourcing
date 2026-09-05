import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";
import { chat } from "@/lib/ai/server";

type Msg={role:"user"|"assistant";content:string};

function intents(q:string){
 const s=q.toLowerCase();
 const all=/数据库|database|全部|overview|总览/.test(s);
 return {
  projects:all||/项目|project/.test(s), suppliers:all||/供应商|supplier/.test(s),
  rfqs:all||/rfq|询价|报价需求/.test(s), inquiries:all||/询盘|inquir|客户/.test(s),
  documents:all||/报价单|合同|document|contract|quotation|订单/.test(s),
  integrations:/mes|erp|wms|接口|integration/.test(s)
 };
}
async function count(table:string){const {count}=await db().from(table).select("*",{count:"exact",head:true});return count||0;}

export async function POST(req:Request){
 const a=verifyWorkspaceKey(req); if(!a.ok)return NextResponse.json({success:false,error:a.error},{status:a.status});
 try{
  const b=await req.json(); const message=String(b?.message||"").trim().slice(0,3000);
  const history=(Array.isArray(b?.history)?b.history:Array.isArray(b?.messages)?b.messages:[]).filter((x:Msg)=>x?.role&&x?.content).slice(-6);
  if(!message)return NextResponse.json({success:false,error:"Message is required."},{status:400});
  const i=intents(message);
  const counts=await Promise.all(["projects","suppliers","rfqs","inquiries","business_documents"].map(count));
  const summary={projects:counts[0],suppliers:counts[1],rfqs:counts[2],inquiries:counts[3],documents:counts[4]};
   const context: Record<string, unknown> = {summary};
  const jobs: Array<PromiseLike<unknown>> = [];
  if(i.projects) jobs.push(db().from("projects").select("id,name,client_name,country,category,target_budget,currency,status,created_at").order("created_at",{ascending:false}).limit(12).then(r=>{context.projects=r.data||[]}));
  if(i.suppliers) jobs.push(db().from("suppliers").select("id,company_name,country,categories,rating,risk_level,created_at").order("created_at",{ascending:false}).limit(15).then(r=>{context.suppliers=r.data||[]}));
  if(i.rfqs) jobs.push(db().from("rfqs").select("id,title,quantity,target_price,currency,status,due_date,created_at").order("created_at",{ascending:false}).limit(15).then(r=>{context.rfqs=r.data||[]}));
  if(i.inquiries) jobs.push(db().from("inquiries").select("id,company_name,contact_name,country,preferred_language,product_name,model_number,quantity,status,created_at").order("created_at",{ascending:false}).limit(12).then(r=>{context.inquiries=r.data||[]}));
  if(i.documents) jobs.push(db().from("business_documents").select("id,document_no,document_type,title,status,customer_name,currency,total,valid_until,created_at").order("created_at",{ascending:false}).limit(15).then(r=>{context.documents=r.data||[]}));
  if(i.integrations) jobs.push(db().from("integration_connections").select("code,name,integration_type,status,last_sync_at,last_error").limit(20).then(r=>{context.integrations=r.data||[]}));
  await Promise.all(jobs);
  const result=await chat([
   {role:"system",content:`You are Blue Whale Business Copilot inside an enterprise operations platform.
Answer in the operator's language. Use DATABASE_CONTEXT as the source of truth.
Default to executive summaries, counts, risks and next actions instead of dumping raw records.
Never expose personal email/phone unless the operator explicitly asks for a specific record.
Never invent prices, suppliers, certifications, MES state or contracts.
If the operator asks for "the database", give a compact snapshot and ask which module to drill into.
Keep normal answers under 500 Chinese characters unless detail is requested.
DATABASE_CONTEXT=${JSON.stringify(context)}`},
   ...history.map((x:Msg)=>({role:x.role,content:String(x.content).slice(0,1200)})),
   {role:"user",content:message}
  ],700);
  return NextResponse.json({success:true,reply:result.text,provider:result.provider,context_modules:Object.keys(context),counts:summary});
 }catch(e:unknown){console.error("[agent]",e);return NextResponse.json({success:false,error:e instanceof Error?e.message:"Copilot failed."},{status:500});}
}
