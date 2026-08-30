import "server-only";
import { db } from "@/lib/database/server";

export function nextDocumentNo(type: string) {
  const prefix: Record<string,string> = { quotation:"QT", contract:"CT", purchase_order:"PO", report:"RP" };
  const d = new Date();
  const stamp = `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,"0")}${String(d.getUTCDate()).padStart(2,"0")}`;
  return `${prefix[type] || "DOC"}-${stamp}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
}

export async function listDocuments(limit=100) {
  const { data, error } = await db().from("business_documents")
    .select("id,document_no,document_type,title,status,customer_name,currency,total,valid_until,created_at,updated_at")
    .order("updated_at",{ascending:false}).limit(Math.min(limit,200));
  if (error) throw error;
  return data || [];
}

export async function audit(action:string, entityType:string, entityId?:string, metadata:any={}) {
  const { error } = await db().from("audit_logs").insert({
    action, entity_type: entityType, entity_id: entityId || null, metadata
  });
  if (error) console.warn("[audit]", error.message);
}
