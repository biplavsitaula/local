"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useProductStore } from '@/hooks/useProductStore';
import { products as productsData } from '@/data/products';
import { productsService } from '@/services/products.service';
import { ordersService } from '@/services/orders.service';
import { paymentsService } from '@/services/payments.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

type DataType = 'products' | 'orders' | 'payments' | 'inventory';

interface PaymentFilters {
  methodFilter?: 'all' | 'qr' | 'cod';
  searchQuery?: string;
  status?: string;
  dateRange?: string;
  minAmount?: string;
  maxAmount?: string;
}

interface OrderFilters {
  search?: string;
  status?: string;
  billNumber?: string;
  location?: string;
  paymentMethod?: string;
}

interface ProductFilters {
  filterType?: 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'top-reviewed' | 'recommended';
  searchQuery?: string;
  category?: string;
  stockStatus?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
}

interface ExportButtonProps {
  defaultDataType?: DataType;
  paymentFilters?: PaymentFilters;
  orderFilters?: OrderFilters;
  productFilters?: ProductFilters;
}

export function ExportButton({ 
  defaultDataType = 'products',
  paymentFilters,
  orderFilters,
  productFilters,
}: ExportButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [dataType, setDataType] = useState<DataType>(defaultDataType);
  const [loading, setLoading] = useState(false);
  
  const { products: storeProducts } = useProductStore();
  
  // Use products from data file (which has the actual products) or merge with store products
  const products = productsData.length > 0 ? productsData : storeProducts;

  // Reset dataType to default when dialog opens
  useEffect(() => {
    if (open) {
      setDataType(defaultDataType);
    }
  }, [open, defaultDataType]);

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
      
      // For products, don't show month/year (they don't have dates)
      const subtitle = dataType === 'products' 
        ? title 
        : `${title} - ${months[parseInt(selectedMonth)]} ${selectedYear}`;
      
      doc.text(
        subtitle,
        doc.internal.pageSize.getWidth() / 2,
        25,
        { align: 'center' }
      );
      
      // Prepare table data - ensure data[0] exists
      if (!data || data.length === 0 || !data[0]) {
        toast.error('No data to export');
        return;
      }
      
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

  // Map API order to export format
  const mapApiOrderToExport = (apiOrder: any) => {
    const customerName = (apiOrder.customer as any)?.fullName || 
                         apiOrder.customer?.name || 
                         apiOrder.customerName || 
                         '';
    const location = (apiOrder.customer as any)?.location || 
                    apiOrder.customer?.address || 
                    apiOrder.location || 
                    '';
    
    return {
      'Bill No': apiOrder.billNumber || '',
      Customer: customerName,
      Location: location,
      'Total Amount': `Rs. ${(apiOrder.totalAmount || 0).toFixed(2)}`,
      Status: apiOrder.status || '',
      'Payment Method': (apiOrder.paymentMethod || '').toLowerCase() === 'cod' ? 'COD' : 'QR',
      Date: apiOrder.createdAt ? new Date(apiOrder.createdAt).toLocaleDateString() : ''
    };
  };

  // Map API payment to export format
  const mapApiPaymentToExport = (apiPayment: any) => {
    const customerName = apiPayment.customer?.fullName || 
                         apiPayment.customer?.name || 
                         apiPayment.customerName || 
                         '';
    
    const method = (apiPayment.method || '').toLowerCase();
    const paymentMethod = method === 'cod' ? 'COD' : (method === 'online' || method === 'qr' || method === 'qr payment' ? 'QR' : 'COD');
    
    return {
      'Bill No': apiPayment.billNumber || '',
      Customer: customerName,
      Amount: `Rs. ${(apiPayment.amount || 0).toFixed(2)}`,
      Method: paymentMethod,
      Status: apiPayment.status || '',
      Date: apiPayment.createdAt ? new Date(apiPayment.createdAt).toLocaleDateString() : ''
    };
  };

  const getFilteredData = async () => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    try {
      switch (dataType) {
        case 'products':
          // Fetch products from API with filters
          const viewMap: Record<string, 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'most-reviewed' | 'recommended'> = {
            'all': 'all',
            'out-of-stock': 'out-of-stock',
            'low-stock': 'low-stock',
            'top-sellers': 'top-sellers',
            'top-reviewed': 'most-reviewed',
            'recommended': 'recommended',
          };

          const apiFilters: any = {
            limit: 1000,
          };

          // Apply view filter (tab filter)
          if (productFilters?.filterType) {
            apiFilters.view = viewMap[productFilters.filterType] || 'all';
          }

          // Apply search query
          if (productFilters?.searchQuery) {
            apiFilters.search = productFilters.searchQuery;
          }

          // Fetch products from API
          const productsResponse = await productsService.getAll(apiFilters);
          let productList = (productsResponse.data || []).map((apiProduct: any) => {
            const category = (apiProduct.type || apiProduct.category || '').toLowerCase();
            return {
              id: apiProduct._id || apiProduct.id || '',
              name: apiProduct.name || '',
              category: category || 'other',
              price: apiProduct.price || 0,
              image: apiProduct.image || apiProduct.imageUrl || '',
              stock: apiProduct.stock || 0,
              rating: apiProduct.rating || 0,
              tag: apiProduct.tag,
              description: apiProduct.description || '',
              sales: apiProduct.sales || apiProduct.totalSold || 0,
              inStock: (apiProduct.stock || 0) > 0,
              isNew: apiProduct.isNew || false,
              volume: apiProduct.volume || '',
              alcoholContent: apiProduct.alcoholContent || apiProduct.alcohol || '',
              origin: apiProduct.origin || '',
            };
          });
          
          // Apply additional client-side filters
          if (productFilters) {
            if (productFilters.category) {
              productList = productList.filter(p => 
                p.category?.toLowerCase() === productFilters.category?.toLowerCase()
              );
            }
            
            if (productFilters.stockStatus) {
              const stock = productFilters.stockStatus.toLowerCase();
              if (stock === 'in-stock') {
                productList = productList.filter(p => (p.stock ?? 0) > 20);
              } else if (stock === 'out-of-stock') {
                productList = productList.filter(p => (p.stock ?? 0) === 0);
              } else if (stock === 'low-stock') {
                productList = productList.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 20);
              }
            }
            
            if (productFilters.minPrice) {
              const min = parseFloat(productFilters.minPrice);
              if (!isNaN(min)) {
                productList = productList.filter(p => (p.price || 0) >= min);
              }
            }
            
            if (productFilters.maxPrice) {
              const max = parseFloat(productFilters.maxPrice);
              if (!isNaN(max)) {
                productList = productList.filter(p => (p.price || 0) <= max);
              }
            }
            
            if (productFilters.minRating) {
              const minRating = parseFloat(productFilters.minRating);
              if (!isNaN(minRating)) {
                productList = productList.filter(p => (p.rating || 0) >= minRating);
              }
            }
          }
          
          return productList.map(p => {
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
              Price: `Rs. ${(p.price || 0).toFixed(2)}`,
              Stock: stock,
              Status: status,
              Rating: (p.rating || 0).toFixed(1),
              Sales: p.sales || 0,
              'In Stock': p.inStock ? 'Yes' : 'No',
              'Is New': p.isNew ? 'Yes' : 'No',
              Volume: p.volume || '',
              'Alcohol Content': p.alcoholContent || '',
              Origin: p.origin || '',
            };
          });
        case 'orders':
          // Build API filters
          const orderApiFilters: any = { limit: 1000 };
          if (orderFilters?.search) {
            orderApiFilters.search = orderFilters.search;
          }
          if (orderFilters?.status) {
            orderApiFilters.status = orderFilters.status;
          }
          if (orderFilters?.paymentMethod) {
            orderApiFilters.paymentMethod = orderFilters.paymentMethod;
          }
          
          // Fetch orders from API
          const ordersResponse = await ordersService.getAll(orderApiFilters);
          let apiOrders = ordersResponse.data || [];
          
          // Apply client-side filters (billNumber, location)
          if (orderFilters?.billNumber) {
            apiOrders = apiOrders.filter((o: any) =>
              o.billNumber?.toLowerCase().includes(orderFilters.billNumber!.toLowerCase())
            );
          }
          
          if (orderFilters?.location) {
            apiOrders = apiOrders.filter((o: any) => {
              const location = (o.customer as any)?.location || 
                              o.customer?.address || 
                              o.location || 
                              '';
              return location.toLowerCase().includes(orderFilters.location!.toLowerCase());
            });
          }
          
          // Filter by month and year
          const filteredOrders = apiOrders.filter((apiOrder: any) => {
            try {
              if (!apiOrder.createdAt) return false;
              const date = new Date(apiOrder.createdAt);
              return date.getMonth() === month && date.getFullYear() === year;
            } catch {
              return false;
            }
          });
          
          return filteredOrders.map(mapApiOrderToExport);
        case 'payments':
          // Fetch payments from API
          const paymentsResponse = await paymentsService.getAll({ limit: 1000 });
          let apiPayments = paymentsResponse.data || [];
          
          // Apply method filter
          if (paymentFilters?.methodFilter && paymentFilters.methodFilter !== 'all') {
            apiPayments = apiPayments.filter((p: any) => {
              const method = (p.method || '').toLowerCase();
              if (paymentFilters.methodFilter === 'qr') {
                return method === 'online' || method === 'qr' || method === 'qr payment';
              } else if (paymentFilters.methodFilter === 'cod') {
                return method === 'cod' || method === 'cash on delivery';
              }
              return true;
            });
          }
          
          // Apply search query
          if (paymentFilters?.searchQuery) {
            const query = paymentFilters.searchQuery.toLowerCase();
            apiPayments = apiPayments.filter((p: any) => {
              const billNumber = p.billNumber || '';
              const customerName = p.customer?.fullName || 
                                 p.customer?.name || 
                                 p.customerName || 
                                 '';
              const status = p.status || '';
              return billNumber.toLowerCase().includes(query) ||
                     customerName.toLowerCase().includes(query) ||
                     status.toLowerCase().includes(query);
            });
          }
          
          // Apply status filter
          if (paymentFilters?.status) {
            apiPayments = apiPayments.filter((p: any) =>
              (p.status || '').toLowerCase() === paymentFilters.status!.toLowerCase()
            );
          }
          
          // Apply amount range filters
          if (paymentFilters?.minAmount) {
            const min = parseFloat(paymentFilters.minAmount);
            if (!isNaN(min)) {
              apiPayments = apiPayments.filter((p: any) => (p.amount || 0) >= min);
            }
          }
          
          if (paymentFilters?.maxAmount) {
            const max = parseFloat(paymentFilters.maxAmount);
            if (!isNaN(max)) {
              apiPayments = apiPayments.filter((p: any) => (p.amount || 0) <= max);
            }
          }
          
          // Apply date range filter (if specified, it overrides month/year selection)
          if (paymentFilters?.dateRange) {
            const now = new Date();
            let cutoffDate = new Date();
            if (paymentFilters.dateRange === '7d') {
              cutoffDate.setDate(now.getDate() - 7);
            } else if (paymentFilters.dateRange === '30d') {
              cutoffDate.setDate(now.getDate() - 30);
            } else if (paymentFilters.dateRange === '90d') {
              cutoffDate.setDate(now.getDate() - 90);
            }
            apiPayments = apiPayments.filter((p: any) => {
              try {
                if (!p.createdAt) return false;
                const paymentDate = new Date(p.createdAt);
                return paymentDate >= cutoffDate;
              } catch {
                return false;
              }
            });
          } else {
            // Filter by month and year only if dateRange is not specified
            apiPayments = apiPayments.filter((apiPayment: any) => {
              try {
                if (!apiPayment.createdAt) return false;
                const date = new Date(apiPayment.createdAt);
                return date.getMonth() === month && date.getFullYear() === year;
              } catch {
                return false;
              }
            });
          }
          
          const filteredPayments = apiPayments;
          
          return filteredPayments.map(mapApiPaymentToExport);
        default:
          return [];
      }
    } catch (error) {
      console.error('Error filtering data:', error);
      toast.error('Failed to fetch data for export');
      return [];
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setLoading(true);
      const data = await getFilteredData();
      
      if (data.length === 0) {
        const errorMsg = dataType === 'products'
          ? `No ${dataType} found matching the current filters.`
          : `No ${dataType} data found for ${months[parseInt(selectedMonth)]} ${selectedYear}. Please select a different month/year.`;
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // For products, don't include month/year in filename
      const monthName = months[parseInt(selectedMonth)];
      const filename = dataType === 'products'
        ? `flame-beverage-${dataType}-export-${new Date().toISOString().split('T')[0]}`
        : `flame-beverage-${dataType}-${monthName}-${selectedYear}`;
      const title = `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`;

      if (format === 'excel') {
        exportToExcel(data, filename);
      } else if (format === 'pdf') {
        exportToPDF(data, filename, title);
      }
      setOpen(false);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()}: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
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
              disabled={loading}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {loading ? 'Exporting...' : 'Export Excel'}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={() => handleExport('pdf')}
              disabled={loading}
            >
              <FileText className="h-4 w-4" />
              {loading ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
