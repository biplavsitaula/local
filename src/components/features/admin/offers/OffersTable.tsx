"use client";

import { useState, useMemo } from 'react';
import { ArrowUpDown, Edit, Trash2, Power, PowerOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddOfferModal } from './AddOfferModal';
import { EditOfferModal } from './EditOfferModal';
import { DeleteOfferModal } from './DeleteOfferModal';
import { Offer } from '@/services/offers.service';
import Image from 'next/image';

type SortKey = 'title' | 'discountPercent' | 'startDate' | 'endDate' | 'isActive';
type SortDir = 'asc' | 'desc';

interface OffersTableProps {
  offers: Offer[];
  onRefresh?: () => void;
}

export function OffersTable({ offers, onRefresh }: OffersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [deleteOffer, setDeleteOffer] = useState<Offer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('desc');
  };

  const sortedOffers = useMemo(() => {
    const sorted = [...offers];
    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortKey) {
        case 'title':
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        case 'discountPercent':
          aVal = a.discountPercent || 0;
          bVal = b.discountPercent || 0;
          break;
        case 'startDate':
          aVal = a.startDate ? new Date(a.startDate).getTime() : 0;
          bVal = b.startDate ? new Date(b.startDate).getTime() : 0;
          break;
        case 'endDate':
          aVal = a.endDate ? new Date(a.endDate).getTime() : 0;
          bVal = b.endDate ? new Date(b.endDate).getTime() : 0;
          break;
        case 'isActive':
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [offers, sortKey, sortDir]);

  const handleEdit = (offer: Offer) => {
    setEditOffer(offer);
    setIsEditModalOpen(true);
  };

  const handleDelete = (offer: Offer) => {
    setDeleteOffer(offer);
    setIsDeleteModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditOffer(null);
    if (onRefresh) onRefresh();
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeleteOffer(null);
    if (onRefresh) onRefresh();
  };

  const renderSortableTh = (label: string, columnKey: SortKey) => (
    <th
      className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground"
      aria-sort={
        sortKey === columnKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        onClick={() => handleSort(columnKey)}
        className={`inline-flex items-center gap-1 sm:gap-2 transition-colors ${
          sortKey === columnKey ? 'text-flame-orange' : 'hover:text-flame-orange'
        }`}
      >
        <span>{label}</span>
        <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
      </button>
    </th>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const isExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isUpcoming = (startDate?: string) => {
    if (!startDate) return false;
    return new Date(startDate) > new Date();
  };

  if (sortedOffers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base md:text-sm text-muted-foreground">No offers found</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground">
                  Image
                </th>
                {renderSortableTh('Title', 'title')}
                {renderSortableTh('Discount', 'discountPercent')}
                {renderSortableTh('Start Date', 'startDate')}
                {renderSortableTh('End Date', 'endDate')}
                {renderSortableTh('Status', 'isActive')}
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOffers.map((offer) => {
                const expired = isExpired(offer.endDate);
                const upcoming = isUpcoming(offer.startDate);
                const active = offer.isActive && !expired && !upcoming;

                return (
                  <tr
                    key={offer._id || offer.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3 sm:p-4">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={offer.imageUrl || offer.image || '/assets/liquor1.jpeg'}
                          alt={offer.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="max-w-[200px]">
                        <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
                          {offer.title}
                        </p>
                        {offer.description && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mt-1">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex flex-col gap-1">
                        {offer.discountPercent && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs sm:text-xs font-medium text-foreground w-fit">
                            {offer.discountPercent}% OFF
                          </span>
                        )}
                        {offer.discountAmount && (
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Rs. {offer.discountAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className="text-xs sm:text-sm text-foreground">
                        {formatDate(offer.startDate)}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className="text-xs sm:text-sm text-foreground">
                        {formatDate(offer.endDate)}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex flex-col gap-1">
                        {active && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/20 text-green-600 border border-green-500/30 text-xs font-medium">
                            Active
                          </span>
                        )}
                        {expired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-500/20 text-red-600 border border-red-500/30 text-xs font-medium">
                            Expired
                          </span>
                        )}
                        {upcoming && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 text-xs font-medium">
                            Upcoming
                          </span>
                        )}
                        {!offer.isActive && !expired && !upcoming && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-500/20 text-gray-600 border border-gray-500/30 text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(offer)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(offer)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && editOffer && (
        <EditOfferModal
          offer={editOffer}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSuccess={handleEditModalClose}
        />
      )}

      {isDeleteModalOpen && deleteOffer && (
        <DeleteOfferModal
          offer={deleteOffer}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={handleDeleteModalClose}
        />
      )}
    </>
  );
}

