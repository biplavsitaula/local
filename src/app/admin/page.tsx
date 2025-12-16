export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Placeholder content */}
      <div className="p-8 bg-card border border-border rounded-lg">
        <p className="text-muted-foreground">Admin dashboard content will be displayed here.</p>
      </div>
    </div>
  );
}
