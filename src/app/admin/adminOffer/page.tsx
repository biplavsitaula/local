"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AddOfferModal, OffersTable } from '@/components/features/admin/offers';
import { offersService, Offer } from '@/services/offers.service';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await offersService.getAllAdmin({
        search: debouncedSearch || undefined,
      });

      if (response.success) {
        setOffers(response.data || []);
      } else {
        setError(response.message || 'Failed to load offers');
        setOffers([]);
      }
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError(err?.message || 'Failed to load offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleAddSuccess = () => {
    fetchOffers();
  };

  const handleRefresh = () => {
    fetchOffers();
  };

  if (loading && offers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-base md:text-sm text-muted-foreground">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (error && offers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-lg sm:text-base font-semibold text-foreground mb-2">Error loading offers</p>
            <p className="text-base md:text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => fetchOffers()}
              className="px-4 py-2 bg-primary-gradient text-text-inverse rounded-lg hover:shadow-primary-lg transition-all cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Offers</h1>
          <p className="text-muted-foreground mt-1">Manage special offers and promotions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search offers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 bg-secondary/50 border-border text-base sm:text-base"
            />
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary-gradient text-text-inverse hover:shadow-primary-lg transition-all cursor-pointer text-base sm:text-base"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        </div>
      </div>

      {/* Offers Table */}
      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <OffersTable offers={offers} onRefresh={handleRefresh} />
      </div>

      {/* Add Offer Modal */}
      <AddOfferModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}



