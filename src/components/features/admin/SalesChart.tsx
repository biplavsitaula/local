"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ISalesChartProps } from '@/interface/iSalesChartProps';

const salesData = [
  { month: 'Jan', sales: 4200 },
  { month: 'Feb', sales: 3800 },
  { month: 'Mar', sales: 4500 },
  { month: 'Apr', sales: 5200 },
  { month: 'May', sales: 4800 },
  { month: 'Jun', sales: 6100 },
];

export function SalesChart({ data }: ISalesChartProps) {
  const chartData = data || salesData;
  
  return (
    <div className="glass-card rounded-xl p-6 border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Sales Trend</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(0 0% 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(0 0% 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0 0% 10%)', 
                border: '1px solid hsl(0 0% 18%)',
                borderRadius: '8px',
                color: 'hsl(40 20% 95%)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              name="Sales"
              stroke="hsl(25 95% 53%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(25 95% 53%)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

