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
    async health(){ if(!base)return {ok:false,message:"MES adapter reserved but not configured."}; try{await call("/health");return {ok:true,message:"MES reachable."};}catch(e:any){return {ok:false,message:e.message};}},
    async pushWorkOrder(payload){ const raw:any=await call("/work-orders",{method:"POST",body:JSON.stringify(payload)}); return {ok:true,externalId:raw?.id||raw?.work_order_id,raw}; }
  };
}
