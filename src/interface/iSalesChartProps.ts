export interface SalesDataItem {
  month: string;
  sales: number;
}

export interface ISalesChartProps {
  data?: SalesDataItem[];
}

