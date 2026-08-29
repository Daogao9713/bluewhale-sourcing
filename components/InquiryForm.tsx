"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSiteLanguage } from "@/components/site/SiteLanguageProvider";

export default function InquiryForm() {
  const router = useRouter();
  const { lang } = useSiteLanguage();
  const [loading, setLoading] = useState(false);

  const t = {
    zh: {
      company: "公司名称",
      name: "联系人姓名",
      email: "邮箱 *",
      phone: "电话 / WhatsApp / WeChat / LINE",
      country: "所在国家 / 地区",
      language: "希望沟通语言",
      product: "产品 / 项目名称",
      model: "型号 / 规格",
      quantity: "采购数量 / 项目规模",
      ems: "需要 EMS / 国际快递",
      detail: "详细需求",
      detailPh: "请填写产品要求、交付国家、付款方式、希望交期、认证、预算等信息。",
      submit: "提交业务需求",
      submitting: "提交中…",
      fail: "提交失败，请稍后再试。",
    },
    ja: {
      company: "会社名",
      name: "ご担当者名",
      email: "メールアドレス *",
      phone: "電話 / WhatsApp / WeChat / LINE",
      country: "国・地域",
      language: "希望言語",
      product: "製品 / プロジェクト名",
      model: "型番 / 仕様",
      quantity: "数量 / プロジェクト規模",
      ems: "EMS / 国際配送が必要",
      detail: "詳細要件",
      detailPh: "製品要件、納品国、支払条件、希望納期、認証、予算などをご記入ください。",
      submit: "相談内容を送信",
      submitting: "送信中…",
      fail: "送信に失敗しました。しばらくしてから再度お試しください。",
    },
    en: {
      company: "Company name",
      name: "Contact person",
      email: "Email *",
      phone: "Phone / WhatsApp / WeChat / LINE",
      country: "Country / region",
      language: "Preferred language",
      product: "Product / project name",
      model: "Model / specification",
      quantity: "Quantity / project scale",
      ems: "Need EMS / international express",
      detail: "Detailed requirements",
      detailPh: "Please include product requirements, destination, payment terms, desired delivery, certification, budget and other relevant information.",
      submit: "Submit business request",
      submitting: "Submitting…",
      fail: "Submission failed. Please try again later.",
    },
  }[lang];

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        form.reset();
        router.push("/inquiry/success");
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Submit error:", errorData);
        alert(t.fail);
      }
    } catch (error) {
      console.error(error);
      alert(t.fail);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.company}</label>
          <input name="companyName" className={inputClass} placeholder={t.company} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.name}</label>
          <input name="contactName" className={inputClass} placeholder={t.name} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.email}</label>
          <input required type="email" name="email" className={inputClass} placeholder="example@email.com" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.phone}</label>
          <input name="phone" className={inputClass} placeholder="+81 / +86 ..." />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.country}</label>
          <input name="country" className={inputClass} placeholder="Japan / China / Germany..." />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.language}</label>
          <select
            name="preferredLanguage"
            className={inputClass}
            defaultValue={lang === "zh" ? "中文" : lang === "ja" ? "日本語" : "English"}
          >
            <option value="中文">中文</option>
            <option value="日本語">日本語</option>
            <option value="English">English</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.product}</label>
          <input name="productName" className={inputClass} placeholder={t.product} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.model}</label>
          <input name="modelNumber" className={inputClass} placeholder={t.model} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">{t.quantity}</label>
          <input name="quantity" className={inputClass} placeholder={t.quantity} />
        </div>

        <div className="flex items-end">
          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="needsEms" />
            {t.ems}
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">{t.detail}</label>
        <textarea
          name="message"
          rows={7}
          className={inputClass}
          placeholder={t.detailPh}
        />
      </div>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-slate-950 px-6 py-4 font-medium text-white transition hover:bg-cyan-700 disabled:opacity-60"
      >
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  );
}
