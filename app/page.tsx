import Link from "next/link";
import HomeContent from "@/components/HomeContent";

const services = [
  {
    title: "厂家对接",
    desc: "根据产品需求快速匹配海外制造商与供应商。",
  },
  {
    title: "产品询价",
    desc: "支持中日英多语言沟通，整理报价、交期和付款条件。",
  },
  {
    title: "样品采购",
    desc: "协助完成样品确认、付款、发货和国际物流安排。",
  },
  {
    title: "出口支持",
    desc: "支持 EMS、国际快递、代理商沟通与出口资料整理。",
  },
];

const steps = ["提交需求", "匹配厂家", "获取报价", "出口交付"];

const trustPoints = [
  "江苏蓝鲸新能源有限公司",
  "中 / 日 / 英多语言沟通",
  "海外厂家对接",
  "样品采购与 EMS / 国际快递支持",
];

export default function Home() {
  return <HomeContent />;
}