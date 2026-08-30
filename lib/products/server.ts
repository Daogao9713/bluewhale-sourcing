import "server-only";
import { db } from "@/lib/database/server";

const PRODUCT_FIELDS =
  "id,model,name,slug,category,description,subtitle,image_url,features,applications,specifications,featured,sort_order,status";

export async function publicProducts(featured = false) {
  const client = db();

  if (!featured) {
    const { data, error } = await client
      .from("xy_products")
      .select(PRODUCT_FIELDS)
      .eq("status", "active")
      .order("sort_order");

    if (error) throw error;
    return data || [];
  }

  const { data: featuredRows, error: featuredError } = await client
    .from("xy_products")
    .select(PRODUCT_FIELDS)
    .eq("status", "active")
    .eq("featured", true)
    .order("sort_order")
    .limit(3);

  if (featuredError) throw featuredError;

  const chosen: any[] = [...(featuredRows || [])];

  if (chosen.length < 3) {
    const { data: all, error } = await client
      .from("xy_products")
      .select(PRODUCT_FIELDS)
      .eq("status", "active")
      .order("sort_order");

    if (error) throw error;

    for (const product of all || []) {
      if (!chosen.some((item) => item.id === product.id) && chosen.length < 3) {
        chosen.push(product);
      }
    }
  }

  return chosen;
}

export async function publicProduct(slug: string) {
  const { data, error } = await db()
    .from("xy_products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data;
}
