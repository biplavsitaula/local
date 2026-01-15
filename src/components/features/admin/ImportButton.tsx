"use client";
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { importService, ImportResult } from '@/services/import.service';

interface ImportButtonProps {
  onImportSuccess?: () => void;
}

export function ImportButton({ onImportSuccess }: ImportButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const blob = await importService.downloadTemplate();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `product-import-template-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      console.error('Download template error:', error);
      toast.error(`Failed to download template: ${error?.message || 'Unknown error'}`);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Set selected file
    setSelectedFile(file);
    setImportResult(null);
    toast.success(`File selected: ${file.name}`);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setImportResult(null);
      
      const response = await importService.importProducts(selectedFile);
      
      if (response.success && response.data) {
        setImportResult(response.data);
        
        if (response.data.success > 0) {
          toast.success(
            `Successfully imported ${response.data.success} product(s)`,
            { duration: 5000 }
          );
          
          // Call success callback if provided
          if (onImportSuccess) {
            onImportSuccess();
          }
        }
        
        if (response.data.failed > 0) {
          toast.warning(
            `${response.data.failed} product(s) failed to import. Check details below.`,
            { duration: 7000 }
          );
        }
        
        // Clear selected file after successful import
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(response.message || 'Import failed');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`Failed to import products: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset state when closing
    if (!newOpen) {
      setImportResult(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-flame-orange/50 text-flame-orange hover:bg-flame-orange/10"
        >
          <Upload className="h-4 w-4" />
          Import Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-flame-orange">Import Products</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Download Template Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Step 1: Download Template</label>
            <p className="text-xs text-muted-foreground">
              Download the Excel template, fill in your product data, and upload it back.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
            >
              {downloadingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Template
                </>
              )}
            </Button>
          </div>

          {/* Upload File Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Step 2: Upload Excel File</label>
            <p className="text-xs text-muted-foreground">
              Select the filled Excel file to import products. (Max size: 10MB)
            </p>
                
                {/* Hidden file input - ALWAYS rendered to maintain ref */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileSelect}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                />
                
                {/* File Selection Area */}
                {!selectedFile ? (
                  <div className="space-y-2">
                    {/* Clickable drop zone */}
                    <div 
                      onClick={handleFileButtonClick}
                      className="relative w-full h-32 rounded-lg border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Click to select Excel file
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          or drag and drop here
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleFileButtonClick}
                    >
                      <Upload className="h-4 w-4" />
                      Choose Excel File
                    </Button>
                  </div>
                ) : (
                  <div className="relative w-full p-4 rounded-lg border border-border bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 p-2 bg-flame-orange/10 rounded-lg">
                        <FileSpreadsheet className="h-6 w-6 text-flame-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={handleRemoveFile}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Import Button - Only show when file is selected */}
                {selectedFile && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-flame-orange/50 text-flame-orange hover:bg-flame-orange/10"
                    onClick={handleImport}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Products
                      </>
                    )}
                  </Button>
                )}
              </div>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
              <h4 className="text-sm font-semibold text-foreground">Import Results</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Success</p>
                    <p className="text-xs text-muted-foreground">{importResult.success} product(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Failed</p>
                    <p className="text-xs text-muted-foreground">{importResult.failed} product(s)</p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">Error Details:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-xs">
                        <AlertCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            Row {error.row}: {error.product}
                          </p>
                          <p className="text-muted-foreground">{error.error}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.message && (
                <p className="text-xs text-muted-foreground mt-2">{importResult.message}</p>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-foreground space-y-1">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>Products with existing IDs will be updated</li>
                  <li>New products will be created if ID is not provided</li>
                  <li>Ensure all required fields are filled correctly</li>
                  <li>Category names must match existing categories</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

