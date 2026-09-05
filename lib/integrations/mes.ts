import "server-only";

export type MESAdapter = {
  health(): Promise<{ok:boolean;message:string}>;
  pushWorkOrder(payload:Record<string,unknown>): Promise<{ok:boolean;externalId?:string;raw?:unknown}>;
};

export function createMESAdapter(): MESAdapter {
  const base=(process.env.MES_API_BASE_URL||"").replace(/\/$/,"");
  const token=process.env.MES_API_TOKEN||"";
  async function call(path:string, init:RequestInit={}){
    if(!base) return {configured:false};
    const res=await fetch(`${base}${path}`,{
      ...init, headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",...(init.headers||{})},
      signal:AbortSignal.timeout(12000), cache:"no-store"
    });
    const raw=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(`MES ${res.status}`);
    return raw;
  }
  return {
    async health(){ if(!base)return {ok:false,message:"MES adapter reserved but not configured."}; try{await call("/health");return {ok:true,message:"MES reachable."};}catch(e:unknown){return {ok:false,message:e instanceof Error?e.message:"MES unavailable."};}},
    async pushWorkOrder(payload){ const raw=await call("/work-orders",{method:"POST",body:JSON.stringify(payload)}); const data = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; return {ok:true,externalId:typeof data.id === "string" ? data.id : typeof data.work_order_id === "string" ? data.work_order_id : undefined,raw}; }
  };
}
