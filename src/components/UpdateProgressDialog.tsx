import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdate: (progressMade: string, progressToGo: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function UpdateProgressDialog({ open, onOpenChange, task, onUpdate, onLoadingChange }: UpdateProgressDialogProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast("Please enter a quick update before submitting.");
      return;
    }
    setSubmitting(true);
    onLoadingChange?.(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-task-progress', {
        body: { task, userUpdate: message }
      });

      if (error) {
        throw new Error(error.message);
      }

      const { progressMade, progressToGo } = data || {};
      if (progressMade || progressToGo) {
        onUpdate(progressMade ?? "", progressToGo ?? "");
        toast.success("Agent updated your plan.");
      } else {
        toast("Agent responded. Showing latest summary.");
      }
      onOpenChange(false);
      setMessage("");
    } catch (err) {
      console.error("Update progress failed", err);
      toast.error(err instanceof Error ? err.message : "Failed to update progress");
    } finally {
      setSubmitting(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Tell your AI coach what you completed or where you're stuck. It will adjust your plan and next steps.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="agent-update">Your update</Label>
          <Textarea
            id="agent-update"
            placeholder="e.g., We finished the survey and collected data 4 days early. Next we will start analysis on Friday."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Updating..." : "Send to Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
