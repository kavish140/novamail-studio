import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, FileText, Copy, MoreHorizontal, Pencil, Trash2, Eye, X, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTemplates, useUser } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/templates")({
  head: () => ({
    meta: [
      { title: "Email Templates — NovaMail" },
      {
        name: "description",
        content: "Create and reuse HTML email templates. Reference them by ID in your API calls.",
      },
    ],
  }),
  component: TemplatesPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  subject: string;
  html: string;
  updatedAt: string;
}

const DEFAULT_HTML = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <h1 style="color: #1a1a2e; margin-bottom: 16px;">Welcome, {{first_name}}!</h1>
  <p style="color: #555; line-height: 1.6;">
    Thanks for joining <strong>{{app_name}}</strong>. We're excited to have you on board.
  </p>
  <a href="{{dashboard_url}}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #6c5ce7; color: white; text-decoration: none; border-radius: 8px;">
    Go to Dashboard
  </a>
</div>`;

const INITIAL_TEMPLATES: Template[] = [];

// ─── Template Editor Dialog ─────────────────────────────────────────────────

function TemplateEditor({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Template;
  onSave: (t: Omit<Template, "id" | "updatedAt">) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [html, setHtml] = useState(initial?.html ?? DEFAULT_HTML);
  const [showPreview, setShowPreview] = useState(true);

  const handleSave = () => {
    if (!name.trim()) return toast.error("Give your template a name");
    onSave({ name: name.trim(), subject: subject.trim(), html });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {initial ? "Edit template" : "New template"}
          </DialogTitle>
          <DialogDescription>
            Use {"{{variables}}"} for dynamic content. Reference this template by ID in your API
            calls.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tmpl-name" className="mb-1.5 block">
                Name
              </Label>
              <Input
                id="tmpl-name"
                placeholder="Welcome email"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tmpl-subject" className="mb-1.5 block">
                Subject line
              </Label>
              <Input
                id="tmpl-subject"
                placeholder="Welcome to {{app_name}}, {{first_name}}!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              HTML body
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <Code2 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPreview ? "Code only" : "Show preview"}
            </Button>
          </div>

          <div className={`grid gap-4 ${showPreview ? "lg:grid-cols-2" : ""}`}>
            <textarea
              id="tmpl-html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<h1>Your email HTML here…</h1>"
              className="min-h-[300px] w-full rounded-xl border border-border/60 bg-background/80 p-4 font-mono text-xs leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
            {showPreview && (
              <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 text-[10px] text-gray-400">Preview</span>
                </div>
                <div
                  className="p-4 min-h-[280px] text-sm"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/60">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{initial ? "Save changes" : "Create template"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TemplatesPage() {
  const { data: user } = useUser();
  const { data: dbTemplates, refetch } = useTemplates();
  const templates = (dbTemplates || []).map(
    (t: { id: string; name: string; subject: string; html: string; updated_at: string }) => ({
      ...t,
      updatedAt: new Date(t.updated_at).toLocaleDateString(),
    }),
  ) as Template[];

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Template | undefined>(undefined);
  const [deleting, setDeleting] = useState<Template | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: Omit<Template, "id" | "updatedAt">) => {
    if (!user) return toast.error("You must be logged in");
    setIsSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("templates")
          .update({
            name: data.name,
            subject: data.subject,
            html: data.html,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Template updated");
      } else {
        const slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .slice(0, 30);
        const id = `tmpl_${slug}_${Math.random().toString(36).slice(2, 6)}`;
        const { error } = await supabase.from("templates").insert({
          id,
          user_id: user.id,
          name: data.name,
          subject: data.subject,
          html: data.html,
        });
        if (error) throw error;
        toast.success("Template created");
      }
      refetch();
      setEditing(undefined);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (t: Template) => {
    try {
      const { error } = await supabase.from("templates").delete().eq("id", t.id);
      if (error) throw error;
      toast.success("Template deleted");
      refetch();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete template");
    } finally {
      setDeleting(null);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Email Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and reuse HTML email templates. Reference them by ID in your API calls.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setEditorOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> New template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface/60 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-surface-elevated mb-5">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold">No templates yet</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Create your first reusable email template and reference it by ID in any API call.
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              setEditing(undefined);
              setEditorOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="group relative rounded-2xl border border-border/60 bg-surface/60 p-5 transition hover:border-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold truncate">{t.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{t.subject}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(t);
                        setEditorOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copy(t.id)}>
                      <Copy className="mr-2 h-3.5 w-3.5" /> Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleting(t)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* ID chip */}
              <div className="mt-3 flex items-center gap-1.5">
                <code className="rounded-md border border-border/60 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {t.id}
                </code>
                <button
                  onClick={() => copy(t.id)}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              {/* Preview toggle */}
              <button
                onClick={() => setPreviewing(previewing === t.id ? null : t.id)}
                className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Eye className="h-3 w-3" />
                {previewing === t.id ? "Hide preview" : "Show preview"}
              </button>

              {previewing === t.id && (
                <div className="mt-3 rounded-xl border border-border/60 bg-white overflow-hidden">
                  <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                  <div
                    className="p-3 text-xs max-h-48 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: t.html }}
                  />
                </div>
              )}

              <div className="mt-3 text-[11px] text-muted-foreground">Updated {t.updatedAt}</div>
            </div>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <TemplateEditor
        open={editorOpen}
        onOpenChange={(o) => {
          setEditorOpen(o);
          if (!o) setEditing(undefined);
        }}
        initial={editing}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              <code className="font-mono">{deleting?.id}</code> will be removed permanently. Any API
              calls referencing this template ID will return an error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && handleDelete(deleting)}
            >
              Delete template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
