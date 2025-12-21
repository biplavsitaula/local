"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useProductStore } from '@/hooks/useProductStore';
import { useOrderStore, type Order, type Payment } from '@/hooks/useOrderStore';
import { products as productsData } from '@/data/products';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

type DataType = 'products' | 'orders' | 'payments';

interface ExportButtonProps {
  defaultDataType?: DataType;
}

export function ExportButton({ defaultDataType = 'products' }: ExportButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [dataType, setDataType] = useState<DataType>(defaultDataType);
  
  const { products: storeProducts } = useProductStore();
  const { orders, payments } = useOrderStore();
  
  // Use products from data file (which has the actual products) or merge with store products
  const products = productsData.length > 0 ? productsData : storeProducts;

  // Reset dataType to default when dialog opens
  useEffect(() => {
    if (open) {
      setDataType(defaultDataType);
      
      // Auto-select a month/year that has data for the selected data type
      if (defaultDataType === 'payments' && payments.length > 0) {
        const latestPayment = payments.reduce((latest, p) => {
          const pDate = new Date(p.createdAt);
          const latestDate = new Date(latest.createdAt);
          return pDate > latestDate ? p : latest;
        });
        const paymentDate = new Date(latestPayment.createdAt);
        setSelectedMonth(String(paymentDate.getMonth()));
        setSelectedYear(String(paymentDate.getFullYear()));
      } else if (defaultDataType === 'orders' && orders.length > 0) {
        const latestOrder = orders.reduce((latest, o) => {
          const oDate = new Date(o.createdAt);
          const latestDate = new Date(latest.createdAt);
          return oDate > latestDate ? o : latest;
        });
        const orderDate = new Date(latestOrder.createdAt);
        setSelectedMonth(String(orderDate.getMonth()));
        setSelectedYear(String(orderDate.getFullYear()));
      }
    }
  }, [open, defaultDataType, payments, orders]);

  const exportToExcel = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Set column widths for better readability
      const maxWidth = 20;
      if (data.length > 0 && Object.keys(data[0]).length > 0) {
        const wscols = Object.keys(data[0]).map(() => ({ wch: maxWidth }));
        ws['!cols'] = wscols;
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      
      // Write file as Excel (.xlsx)
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      toast.success(`${filename}.xlsx downloaded successfully`);
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      toast.error(`Failed to export Excel file: ${error?.message || 'Unknown error'}`);
    }
  };

  const exportToPDF = (data: any[], filename: string, title: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(249, 115, 22); // Orange color #f97316
      doc.text('🔥 Flame Beverage', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(102, 102, 102); // Gray color
      doc.text(
        `${title} - ${months[parseInt(selectedMonth)]} ${selectedYear}`,
        doc.internal.pageSize.getWidth() / 2,
        25,
        { align: 'center' }
      );
      
      // Prepare table data
      const headers = Object.keys(data[0]);
      const rows = data.map(row => 
        headers.map(header => {
          let cell = row[header];
          if (typeof cell === 'object' && cell !== null) {
            cell = JSON.stringify(cell);
          }
          return String(cell || '');
        })
      );
      
      // Add table using autoTable - function call approach (v5.0.0+)
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        theme: 'striped',
        headStyles: {
          fillColor: [249, 115, 22], // Orange background
          textColor: [255, 255, 255], // White text
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [249, 249, 249], // Light gray for alternate rows
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        margin: { top: 35 },
      });
      
      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(102, 102, 102);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          'Flame Beverage Admin Panel',
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 5,
          { align: 'center' }
        );
      }
      
      // Save PDF
      doc.save(`${filename}.pdf`);
      toast.success(`${filename}.pdf downloaded successfully`);
    } catch (error: any) {
      console.error('Error exporting to PDF:', error);
      toast.error(`Failed to export PDF file: ${error?.message || 'Unknown error'}`);
    }
  };

  const getFilteredData = () => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    try {
      switch (dataType) {
        case 'products':
          return products.map(p => {
            const stock = p.stock ?? 0;
            let status = 'In Stock';
            if (stock === 0) {
              status = 'Out of Stock';
            } else if (stock <= 20) {
              status = 'Low Stock';
            }
            
            return {
              Name: p.name || '',
              Category: p.category || '',
              Price: `$${(p.price || 0).toFixed(2)}`,
              Stock: stock,
              Status: status,
              Rating: (p.rating || 0).toFixed(1),
              Sales: p.sales || 0,
              'In Stock': p.inStock ? 'Yes' : 'No',
              'Is New': p.isNew ? 'Yes' : 'No',
              Volume: p.volume || '',
              'Alcohol Content': p.alcoholContent || p.alcohol || '',
              Origin: p.origin || '',
            };
          });
        case 'orders':
          return orders
            .filter((o: Order) => {
              try {
                const date = new Date(o.createdAt);
                return date.getMonth() === month && date.getFullYear() === year;
              } catch {
                return false;
              }
            })
            .map((o: Order) => ({
              'Bill No': o.billNumber || '',
              Customer: o.customerName || '',
              Location: o.location || '',
              'Total Amount': `$${(o.totalAmount || 0).toFixed(2)}`,
              Status: o.status || '',
              'Payment Method': o.paymentMethod === 'cod' ? 'COD' : 'QR',
              Date: new Date(o.createdAt).toLocaleDateString()
            }));
        case 'payments':
          return payments
            .filter((p: Payment) => {
              try {
                const date = new Date(p.createdAt);
                return date.getMonth() === month && date.getFullYear() === year;
              } catch {
                return false;
              }
            })
            .map((p: Payment) => ({
              'Bill No': p.billNumber || '',
              Customer: p.customerName || '',
              Amount: `$${(p.amount || 0).toFixed(2)}`,
              Method: p.method === 'cod' ? 'COD' : 'QR',
              Status: p.status || '',
              Date: new Date(p.createdAt).toLocaleDateString()
            }));
        default:
          return [];
      }
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const data = getFilteredData();
    
    if (data.length === 0) {
      toast.error(`No ${dataType} data found for ${months[parseInt(selectedMonth)]} ${selectedYear}. Please select a different month/year.`);
      return;
    }
    
    const monthName = months[parseInt(selectedMonth)];
    const filename = `flame-beverage-${dataType}-${monthName}-${selectedYear}`;
    const title = `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`;

    try {
      if (format === 'excel') {
        exportToExcel(data, filename);
      } else if (format === 'pdf') {
        exportToPDF(data, filename, title);
      }
      setOpen(false);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()}: ${error?.message || 'Unknown error'}`);
    }
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
              onClick={() => handleExport('excel')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
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
