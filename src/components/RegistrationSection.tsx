import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const REGISTRATION_CLOSED_MESSAGE =
  "Registration for VibeCoding 6.0 is now closed. We are no longer accepting new submissions.";

export function RegistrationDialog() {
  const [open, setOpen] = useState(false);

  // Listen for a global event to open the "registrations closed" dialog.
  // This lets buttons across the app trigger the closed-message without
  // threading state through many components.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-registration-closed-dialog", handler as EventListener);
    return () => window.removeEventListener("open-registration-closed-dialog", handler as EventListener);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto border-white/5 bg-card/98 p-0 shadow-[var(--shadow-elevate)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center sm:px-8">
          <div className="grid size-16 place-items-center rounded-full border border-saffron/30 bg-saffron/10 text-saffron">
            <ShieldAlert className="size-8" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="font-display text-2xl font-bold text-foreground">
              Registrations are closed
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              {REGISTRATION_CLOSED_MESSAGE} Thank you for your interest and support. Follow our
              official updates for the next edition.
            </DialogDescription>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
            Stay tuned on the website and LinkedIn for future opportunities.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
