'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = [
  '#2b00ff', '#136100', '#ff002f', '#f87204', '#4a1a00',
  '#00ffbb', '#d97706', '#4f46e5', '#be185d', '#059669',
  '#7c3aed', '#c026d3', '#0284c7', '#65a30d', '#e11d48',
];

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function TopCandidatesChart({ data }: { data: ChartData[] }) {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">Top Candidates by Votes</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <BarChart data={data} layout="vertical" margin={{ left: isMobile ? 0 : 20, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={isMobile ? 90 : 150}
            tick={{ fontSize: isMobile ? 9 : 11 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value: number) => [value.toLocaleString(), 'Votes']}
          />
          <Bar dataKey="value" fill="#dc2626" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PartyPieChart({ data, title }: { data: ChartData[]; title: string }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">{title}</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 35 : 60}
            outerRadius={isMobile ? 70 : 120}
            paddingAngle={2}
            dataKey="value"
            label={isMobile ? false : ({ name, value }) => `${name}: ${((value / total) * 100).toFixed(1)}%`}
            labelLine={isMobile ? false : { strokeWidth: 1 }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
          <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VoteBarChart({ data, title }: { data: ChartData[]; title: string }) {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base truncate">{title}</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 350}>
        <BarChart data={data} margin={{ bottom: isMobile ? 40 : 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: isMobile ? 8 : 10 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={isMobile ? 60 : 80}
          />
          <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value: number) => [value.toLocaleString(), 'Votes']}
          />
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AgeDistributionChart({ data }: { data: ChartData[] }) {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">Age Group Distribution</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: isMobile ? 9 : 12 }} />
          <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
          <Bar dataKey="count" name="Candidates" fill="#9333ea" radius={[4, 4, 0, 0]} />
          <Bar dataKey="votes" name="Total Votes" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GenderChart({ data }: { data: ChartData[] }) {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">Gender Distribution</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 35 : 50}
            outerRadius={isMobile ? 70 : 100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={['#2563eb', '#9333ea', '#ea580c'][index % 3]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
