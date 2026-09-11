import type { Metadata } from 'next';
import FactoryConsole from '@/components/factory/FactoryConsole';

export const metadata: Metadata = {
  title: '智慧工厂 · 3D 冲压产线交互演示',
  description: '体验冲压产线数字孪生：三维工厂、工艺参数仿真、质量监控、合成 MES 追溯与 AI 协同调控演示。',
  alternates: { canonical: '/smart-factory' },
  openGraph: { title: '星玥阳智慧工厂 · 交互演示', description: '从实时感知，到有依据的生产决策。合成数据与仿真控制。', url: '/smart-factory' },
};

export default function SmartFactoryPage() {
  return <FactoryConsole />;
}
