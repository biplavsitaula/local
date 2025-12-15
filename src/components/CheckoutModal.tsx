import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CheckoutModal = ({ open, onClose }: Props) => {
  const { copy } = useLanguage();
  const { items, total } = useCart();
  const [paid, setPaid] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setPaid(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-xl rounded-3xl border border-amber-500/30 bg-[#0f0c19] p-6 shadow-amber-500/30 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300/70">{copy.checkout}</p>
            <h3 className="text-2xl font-semibold text-amber-50">{copy.paymentTitle}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-sm text-amber-300 underline underline-offset-4"
          >
            {copy.continue}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setPaid(true)}
            className="w-full rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-left font-semibold text-black"
          >
            {copy.cod}
          </button>
          <button
            onClick={() => setPaid(true)}
            className="w-full rounded-xl border border-amber-500/40 bg-[#181320] px-4 py-3 text-left font-semibold text-amber-100"
          >
            {copy.online}
          </button>
        </div>
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-black/30 p-4 text-sm text-amber-200">
          <div className="flex items-center justify-between">
            <span>{copy.total}</span>
            <span className="text-lg font-semibold text-amber-50">${total.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-amber-300/80">Items: {items.length}</p>
        </div>
        {paid && (
          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/30 to-orange-500/30 p-4 text-amber-50">
            <p className="text-lg font-semibold">{copy.success}</p>
            <p className="text-sm text-amber-100/80">
              You’ll get updates for delivery windows. Thank you!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
