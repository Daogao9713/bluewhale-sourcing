import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";
import { createMESAdapter } from "@/lib/integrations/mes";

export async function GET(req:Request){
 const a=verifyWorkspaceKey(req); if(!a.ok)return NextResponse.json({success:false,error:a.error},{status:a.status});
 const {data,error}=await db().from("integration_connections").select("id,code,name,integration_type,status,base_url,last_sync_at,last_error,updated_at").order("name");
 if(error)return NextResponse.json({success:false,error:error.message},{status:500});
 const mes=await createMESAdapter().health();
 return NextResponse.json({success:true,connections:data||[],mes});
}
