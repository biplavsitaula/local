import { OrderTable } from '@/components/features/admin/orders/OrderTable';
import { ExportButton } from '@/components/features/admin/ExportButton';

const Orders = () => {
  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between opacity-0 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">Manage customer orders and track deliveries</p>
          </div>
          <ExportButton defaultDataType="orders" />
        </div>

        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <OrderTable />
        </div>
      </div>
  );
};

export default Orders;
