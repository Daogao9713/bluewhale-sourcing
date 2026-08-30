export const company = {
  nameZh: "江苏星玥阳科技有限公司",
  brand: "UNIVERSE TECH · 星玥阳",
  shortName: "星玥阳科技",
  tagline: "研发、制造科学仪器和智能工业在线系统",
  address: "苏州工业园区凤里街272号3号楼1001-3室",
  contact: "周经理",
  phone: "18761966231",
  qq: "305683383",
  industries: ["炼油", "化工", "煤电", "制药", "烟草", "农业"],
  capabilities: ["近红外", "红外", "拉曼", "全息感知", "离线检测", "在线检测", "整体技术解决方案"],
};

export const products = [
  {
    slug: "nc-300",
    model: "NC-300",
    name: "入炉煤煤质在线监测系统",
    category: "煤质在线监测",
    summary: "面向工业现场的入炉煤煤质在线监测产品。",
    image: null,
  },
  {
    slug: "nc-500",
    model: "NC-500",
    name: "风粉在线监测系统",
    category: "工业在线监测",
    summary: "面向工业现场的风粉在线监测产品。",
    image: null,
  },
  {
    slug: "nc-700",
    model: "NC-700",
    name: "润滑油在线监测系统",
    category: "油液在线监测",
    summary: "面向工业现场的润滑油在线监测产品。",
    image: null,
  },
] as const;

export const cases = [
  { slug: "refining", industry: "炼油", title: "炼油行业智能在线检测", status: "案例内容待补充" },
  { slug: "chemical", industry: "化工", title: "化工行业过程分析", status: "案例内容待补充" },
  { slug: "coal-power", industry: "煤电", title: "煤电行业在线监测", status: "案例内容待补充" },
] as const;
