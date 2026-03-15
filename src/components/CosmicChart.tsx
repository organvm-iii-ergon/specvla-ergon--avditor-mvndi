"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface CosmicChartProps {
  scores: {
    communication: number;
    aesthetic: number;
    drive: number;
    structure: number;
  };
}

export default function CosmicChart({ scores }: CosmicChartProps) {
  const data = [
    { subject: 'Communication (Mercury)', A: scores.communication || 0, fullMark: 100 },
    { subject: 'Aesthetic (Venus)', A: scores.aesthetic || 0, fullMark: 100 },
    { subject: 'Drive (Mars)', A: scores.drive || 0, fullMark: 100 },
    { subject: 'Structure (Saturn)', A: scores.structure || 0, fullMark: 100 },
  ];

  return (
    <div style={{ width: '100%', height: 400, marginTop: '2rem', marginBottom: '2rem' }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 14 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Alignment Score" dataKey="A" stroke="var(--secondary)" fill="var(--accent)" fillOpacity={0.5} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: '#fff' }}
            itemStyle={{ color: 'var(--secondary)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
