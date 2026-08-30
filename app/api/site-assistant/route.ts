import { NextResponse } from "next/server"; import { chat } from "@/lib/ai/server"; import { company, products } from "@/lib/xingyueyang";
export async function POST(req:Request){try{const b=await req.json();const message=String(b?.message||"").trim().slice(0,1600);if(!message)return NextResponse.json({error:"Message required."},{status:400});
const r=await chat([{role:"system",content:`你是江苏星玥阳科技有限公司官方网站的智能产品与方案顾问。只能基于下列已确认资料回答，不得编造技术参数、客户案例、认证、价格、测量精度或项目业绩。若资料不足，应建议联系周经理进一步确认。回答简洁专业。
公司=${JSON.stringify(company)}
产品=${JSON.stringify(products)}`},{role:"user",content:message}],500);
return NextResponse.json({success:true,reply:r.text});}catch(e:any){console.error("[site-assistant]",e);return NextResponse.json({error:e.message||"AI unavailable."},{status:500});}}
