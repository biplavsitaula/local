"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Package } from "lucide-react";

interface SuccessMsgModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  title?: string;
  // Optional order status props
  orderStatus?: 'pending' | 'accepted' | 'rejected' | string;
  billNumber?: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
}

export function SuccessMsgModal({
  open,
  onOpenChange,
  message,
  title = "Success",
  orderStatus,
  billNumber,
  variant = 'success',
}: SuccessMsgModalProps) {
  // Determine variant from orderStatus if not explicitly set
  const effectiveVariant = orderStatus 
    ? (orderStatus === 'accepted' ? 'success' : orderStatus === 'rejected' ? 'error' : 'warning')
    : variant;

  const getIcon = () => {
    switch (effectiveVariant) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Package className="h-6 w-6 text-blue-500" />;
    }
  };

  const getButtonClass = () => {
    switch (effectiveVariant) {
      case 'success':
        return "bg-green-600 hover:bg-green-700";
      case 'error':
        return "bg-red-600 hover:bg-red-700";
      case 'warning':
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  const getStatusBadge = () => {
    if (!orderStatus) return null;
    
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-600', label: 'Pending' },
      accepted: { bg: 'bg-green-500/20', text: 'text-green-600', label: 'Accepted' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-600', label: 'Rejected' },
    };
    
    const config = statusConfig[orderStatus] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground flex items-center gap-2">
            {getIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-foreground">
            {message}
          </p>
          
          {/* Order Details */}
          {(billNumber || orderStatus) && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              {billNumber && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-semibold text-foreground">{billNumber}</span>
                </div>
              )}
              {orderStatus && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge()}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`${getButtonClass()} text-white`}
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



