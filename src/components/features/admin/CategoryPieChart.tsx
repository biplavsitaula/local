"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ICategoryPieChartProps } from '@/interface/iCategoryPieChartProps';

const categoryData = [
  { name: 'Whiskey', value: 35 },
  { name: 'Vodka', value: 25 },
  { name: 'Rum', value: 15 },
  { name: 'Wine', value: 12 },
  { name: 'Beer', value: 8 },
  { name: 'Other', value: 5 },
];

const COLORS = [
  'hsl(25 95% 53%)',
  'hsl(0 72% 51%)',
  'hsl(45 93% 47%)',
  'hsl(142 76% 36%)',
  'hsl(280 60% 50%)',
  'hsl(0 0% 15%)',
];

export function CategoryPieChart({ data }: ICategoryPieChartProps) {
  const chartData = data || categoryData;
  
  return (
    <div className="glass-card rounded-xl p-6 border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Products by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0 0% 10%)', 
                border: '1px solid hsl(0 0% 18%)',
                borderRadius: '8px',
                color: 'hsl(40 20% 95%)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

