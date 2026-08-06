"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InquiryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget;

  setLoading(true);

  const formData = new FormData(form);

  const data = {
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    preferredLanguage: formData.get("preferredLanguage"),
    productName: formData.get("productName"),
    modelNumber: formData.get("modelNumber"),
    quantity: formData.get("quantity"),
    needsEms: formData.get("needsEms") === "on",
    message: formData.get("message"),
  };

  try {
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      form.reset();
      router.push("/inquiry/success");
    } else {
      const errorData = await res.json().catch(() => null);
      console.error("Submit error:", errorData);
      alert("提交失败，请稍后再试。 Submission failed, please try again later.");
    }
  } catch (error) {
    console.error(error);
    alert("提交失败，请稍后再试。 Submission failed, please try again later.");
  } finally {
    setLoading(false);
  }
}

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            公司名称  The name of company
          </label>
          <input
            name="companyName"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="Company name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            联系人姓名 Your name
          </label>
          <input
            name="contactName"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="Contact person"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            邮箱 * Email *
          </label>
          <input
            required
            type="email"
            name="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            电话 / WhatsApp / WeChat / Line / phone number
          </label>
          <input
            name="phone"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="+81 / +86 ..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            所在国家 Your country
          </label>
          <input
            name="country"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="Japan, USA, Germany..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            希望语言 language preference
          </label>
          <select
            name="preferredLanguage"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            defaultValue="中文"
          >
            <option value="中文">中文</option>
            <option value="日本語">日本語</option>
            <option value="English">English</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            产品名称 Product name
          </label>
          <input
            name="productName"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="Product name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            产品型号  Model number
          </label>
          <input
            name="modelNumber"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="Model number"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            采购数量 Quantity
          </label>
          <input
            name="quantity"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
            placeholder="100 pcs"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="needsEms" />
            需要 EMS / 国际快递 Need EMS / International Express
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          详细需求  Detailed requirements
        </label>
        <textarea
          name="message"
          rows={6}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
          placeholder="请填写产品要求、交货国家、付款方式、希望交期等信息。 Please fill in product requirements, delivery country, payment method, expected delivery date, etc."
        />
      </div>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-slate-950 px-6 py-4 font-medium text-white transition hover:bg-cyan-700 disabled:opacity-60"
      >
        {loading ? "提交中..." : "提交采购需求 Submit Inquiry"}
      </button>
    </form>
  );
}