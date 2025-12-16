"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useProductStore } from '@/hooks/useProductStore';
import { useOrderStore, type Order, type Payment } from '@/hooks/useOrderStore';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

type DataType = 'products' | 'orders' | 'payments';

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [dataType, setDataType] = useState<DataType>('products');
  
  const { products } = useProductStore();
  const { orders, payments } = useOrderStore();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let cell = row[header];
          if (typeof cell === 'object') cell = JSON.stringify(cell);
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`${filename} downloaded successfully`);
  };

  const exportToPDF = (data: any[], filename: string, title: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #f97316; text-align: center; }
          h2 { color: #666; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f97316; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 8px; font-size: 11px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🔥 Flame Beverage</h1>
        <h2>${title} - ${months[parseInt(selectedMonth)]} ${selectedYear}</h2>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>${headers.map(h => {
                let cell = row[h];
                if (typeof cell === 'object') cell = JSON.stringify(cell);
                return `<td>${cell}</td>`;
              }).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Flame Beverage Admin Panel</p>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      toast.error('Please allow popups to export PDF');
    }
  };

  const getFilteredData = () => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    switch (dataType) {
      case 'products':
        return products.map(p => ({
          Name: p.name,
          Category: p.category,
          Price: `$${p.price.toFixed(2)}`,
          Stock: p.stock,
          Status: p.status,
          Rating: p.rating,
          Reviews: p.reviews,
          Sales: p.sales,
          Recommended: p.isRecommended ? 'Yes' : 'No'
        }));
      case 'orders':
        return orders
          .filter((o: Order) => {
            const date = new Date(o.createdAt);
            return date.getMonth() === month && date.getFullYear() === year;
          })
          .map((o: Order) => ({
            'Bill No': o.billNumber,
            Customer: o.customerName,
            Location: o.location,
            'Total Amount': `$${o.totalAmount.toFixed(2)}`,
            Status: o.status,
            'Payment Method': o.paymentMethod === 'cod' ? 'COD' : 'QR',
            Date: new Date(o.createdAt).toLocaleDateString()
          }));
      case 'payments':
        return payments
          .filter((p: Payment) => {
            const date = new Date(p.createdAt);
            return date.getMonth() === month && date.getFullYear() === year;
          })
          .map((p: Payment) => ({
            'Bill No': p.billNumber,
            Customer: p.customerName,
            Amount: `$${p.amount.toFixed(2)}`,
            Method: p.method === 'cod' ? 'COD' : 'QR',
            Status: p.status,
            Date: new Date(p.createdAt).toLocaleDateString()
          }));
      default:
        return [];
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    const data = getFilteredData();
    const monthName = months[parseInt(selectedMonth)];
    const filename = `flame-beverage-${dataType}-${monthName}-${selectedYear}`;
    const title = `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`;

    if (format === 'csv') {
      exportToCSV(data, `${filename}.csv`);
    } else {
      exportToPDF(data, `${filename}.pdf`, title);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-flame-orange/50 text-flame-orange hover:bg-flame-orange/10">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-flame-orange">Export Monthly Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data Type</label>
            <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, idx) => (
                    <SelectItem key={idx} value={String(idx)}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={() => handleExport('csv')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
