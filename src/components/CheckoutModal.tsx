import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {IPaymentCheckbox} from "@/interface/IPaymentCheckout"


const CheckoutModal = ({ open, onClose }: IPaymentCheckbox) => {
  const { copy } = useLanguage();
  const { items, total } = useCart();
  const [paid, setPaid] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setPaid(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-4 backdrop-blur">
      <div className="w-full max-w-xl rounded-3xl border border-flame-orange/30 bg-card p-6 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-flame-orange/70">{copy.checkout}</p>
            <h3 className="text-2xl font-semibold text-foreground">{copy.paymentTitle}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-sm text-flame-orange underline underline-offset-4"
          >
            {copy.continue}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setPaid(true)}
            className="w-full rounded-xl border border-flame-orange/40 gradient-gold px-4 py-3 text-left font-semibold text-primary-foreground"
          >
            {copy.cod}
          </button>
          <button
            onClick={() => setPaid(true)}
            className="w-full rounded-xl border border-flame-orange/40 bg-secondary px-4 py-3 text-left font-semibold text-foreground"
          >
            {copy.online}
          </button>
        </div>
        <div className="mt-4 rounded-2xl border border-flame-orange/20 bg-secondary/30 p-4 text-sm text-foreground">
          <div className="flex items-center justify-between">
            <span>{copy.total}</span>
            <span className="text-lg font-semibold text-foreground">${total.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-muted-foreground">Items: {items.length}</p>
        </div>
        {paid && (
          <div className="mt-4 rounded-2xl border border-flame-orange/40 bg-gradient-to-r from-flame-orange/30 to-flame-red/30 p-4 text-foreground">
            <p className="text-lg font-semibold">{copy.success}</p>
            <p className="text-sm text-muted-foreground">
              You'll get updates for delivery windows. Thank you!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
