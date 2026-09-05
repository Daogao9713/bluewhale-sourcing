import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";
import { audit, listDocuments, nextDocumentNo } from "@/lib/documents/server";

function auth(req:Request){ const a=verifyWorkspaceKey(req); return a.ok?null:NextResponse.json({success:false,error:a.error},{status:a.status}); }

export async function GET(req:Request){
  const blocked=auth(req); if(blocked)return blocked;
  try { return NextResponse.json({success:true,documents:await listDocuments()}); }
  catch(e:unknown){ console.error("[documents:get]",e); return NextResponse.json({success:false,error:"Failed to load documents."},{status:500}); }
}

export async function POST(req:Request){
  const blocked=auth(req); if(blocked)return blocked;
  try{
    const b=await req.json();
    const type=["quotation","contract","purchase_order","report"].includes(b.document_type)?b.document_type:"quotation";
    const items=Array.isArray(b.items)?b.items.slice(0,100):[];
    const subtotal=items.reduce((n:number,x:Record<string, unknown>)=>n+(Number(x.quantity)||0)*(Number(x.unit_price)||0),0);
    const tax=Number(b.tax)||0;
    const row={
      document_no: nextDocumentNo(type), document_type:type,
      title:String(b.title||"Untitled document").slice(0,240),
      status:"draft", project_id:b.project_id||null, supplier_id:b.supplier_id||null,
      customer_name:String(b.customer_name||"").slice(0,240)||null,
      customer_email:String(b.customer_email||"").slice(0,320)||null,
      currency:String(b.currency||"USD").slice(0,12),
      subtotal, tax, total:subtotal+tax, valid_until:b.valid_until||null,
      content:{items,terms:String(b.terms||"").slice(0,12000)}, notes:String(b.notes||"").slice(0,12000)||null
    };
    const {data,error}=await db().from("business_documents").insert(row).select("*").single();
    if(error)throw error;
    await audit("create","business_document",data.id,{document_no:data.document_no,type});
    return NextResponse.json({success:true,document:data});
  }catch(e:unknown){console.error("[documents:post]",e);return NextResponse.json({success:false,error:e instanceof Error?e.message:"Create failed."},{status:500});}
}
