export interface StockDataItem {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface IStockChartProps {
  data?: StockDataItem[];
}
