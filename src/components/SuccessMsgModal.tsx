"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessMsgModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  title?: string;
}

export function SuccessMsgModal({
  open,
  onOpenChange,
  message,
  title = "Success",
}: SuccessMsgModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-foreground">
            {message}
          </p>
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-success hover:bg-success/90"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

