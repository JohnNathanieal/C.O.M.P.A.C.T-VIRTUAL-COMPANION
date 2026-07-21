import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const STATUS_META = [
  { key: 'pending', label: 'Pending', cssVar: '--chart-3' },
  { key: 'in_progress', label: 'In Progress', cssVar: '--chart-1' },
  { key: 'completed', label: 'Completed', cssVar: '--chart-2' },
];

export default function TaskStatusChart({ tasks }) {
  const data = STATUS_META.map(({ key, label, cssVar }) => ({
    name: label,
    value: tasks.filter((t) => t.status === key).length,
    cssVar,
  })).filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-2">Status Overview</h3>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={i} style={{ fill: `hsl(var(${entry.cssVar}))` }} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}