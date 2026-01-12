import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRenderedProjects, RenderedProject, TailorTransfer } from "@/hooks/useRenderedProjects";
import { useAuth } from "@/contexts/AuthContext";
import {
  FolderOpen,
  Trash2,
  Edit3,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";

// Mock tailors for demo - in production this would come from the database
const availableTailors = [
  { id: "tailor-1", name: "Amara Okonkwo", specialization: "Traditional" },
  { id: "tailor-2", name: "Chen Wei Studio", specialization: "Business" },
  { id: "tailor-3", name: "Isabella Rossi", specialization: "Evening Wear" },
  { id: "tailor-4", name: "Marcus Johnson", specialization: "Streetwear" },
  { id: "tailor-5", name: "Priya Sharma", specialization: "Bridal" },
];

interface ProjectsPanelProps {
  onSelectProject?: (project: RenderedProject) => void;
}

export function ProjectsPanel({ onSelectProject }: ProjectsPanelProps) {
  const { user } = useAuth();
  const {
    projects,
    transfers,
    isLoading,
    deleteProject,
    renameProject,
    transferToTailor,
    loadProjects,
  } = useRenderedProjects();

  const [selectedProject, setSelectedProject] = useState<RenderedProject | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedTailor, setSelectedTailor] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  const handleRename = async () => {
    if (!selectedProject || !newName.trim()) return;
    setIsSubmitting(true);
    await renameProject(selectedProject.id, newName.trim());
    setIsSubmitting(false);
    setIsRenameOpen(false);
    setSelectedProject(null);
    setNewName("");
  };

  const handleTransfer = async () => {
    if (!selectedProject || !selectedTailor) return;
    const tailor = availableTailors.find(t => t.id === selectedTailor);
    if (!tailor) return;

    setIsSubmitting(true);
    await transferToTailor(selectedProject.id, tailor.id, tailor.name, transferNotes);
    setIsSubmitting(false);
    setIsTransferOpen(false);
    setSelectedProject(null);
    setSelectedTailor("");
    setTransferNotes("");
  };

  const handleDelete = async (project: RenderedProject) => {
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      await deleteProject(project.id);
    }
  };

  const getTransferStatus = (projectId: string): TailorTransfer | undefined => {
    return transfers.find(t => t.rendered_project_id === projectId);
  };

  const getStatusBadge = (status: TailorTransfer['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'accepted':
        return <Badge className="gap-1 bg-blue-500"><CheckCircle2 className="w-3 h-3" />Accepted</Badge>;
      case 'completed':
        return <Badge className="gap-1 bg-green-500"><CheckCircle2 className="w-3 h-3" />Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-2">Sign in to view projects</h3>
        <p className="text-sm text-muted-foreground">
          Your saved photorealistic designs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">My Projects</h3>
          <Badge variant="secondary" className="ml-auto">{projects.length}</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No projects yet. Generate a photorealistic design to get started!
              </p>
            </div>
          ) : (
            projects.map((project) => {
              const transfer = getTransferStatus(project.id);
              return (
                <Card
                  key={project.id}
                  className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                  onClick={() => onSelectProject?.(project)}
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={project.rendered_image_url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                    {transfer && (
                      <div className="absolute top-2 left-2">
                        {getStatusBadge(transfer.status)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setNewName(project.name);
                            setIsRenameOpen(true);
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setIsTransferOpen(true);
                          }}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {project.style && (
                        <Badge variant="outline" className="text-xs">{project.style}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(project.created_at), 'MMM d')}
                      </span>
                    </div>
                    {transfer && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent to {transfer.tailor_name}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>Enter a new name for your project.</DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRename} disabled={isSubmitting || !newName.trim()}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer to Tailor Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send to Tailor</DialogTitle>
            <DialogDescription>
              Transfer this design to a tailor for production.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Tailor</Label>
              <Select value={selectedTailor} onValueChange={setSelectedTailor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tailor..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTailors.map((tailor) => (
                    <SelectItem key={tailor.id} value={tailor.id}>
                      <div className="flex items-center gap-2">
                        <span>{tailor.name}</span>
                        <Badge variant="outline" className="text-xs">{tailor.specialization}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Any special instructions for the tailor..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={isSubmitting || !selectedTailor} className="gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send to Tailor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
