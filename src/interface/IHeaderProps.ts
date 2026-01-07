export interface IHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onCheckout?: () => void;
    onLoginClick?: () => void;
  }