"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { stockData } from '@/data/mockData';
import { IStockChartProps } from '@/interface/iStockChartProps';

export function StockChart({ data }: IStockChartProps) {
  const chartData = data || stockData;
  
  return (
    <div className="glass-card rounded-xl p-6 border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Stock by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" opacity={0.3} />
            <XAxis 
              dataKey="category" 
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
            <Bar 
              dataKey="inStock" 
              name="In Stock"
              fill="hsl(142 76% 36%)" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="lowStock" 
              name="Low Stock"
              fill="hsl(25 95% 53%)" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="outOfStock" 
              name="Out of Stock"
              fill="hsl(280 60% 50%)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
