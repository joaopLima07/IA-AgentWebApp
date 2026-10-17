import { useMemo, useState } from "react";
import { FileText, MoreHorizontal, RotateCw, Search, Trash2 } from "lucide-react";
import { useDeleteDocument, useDocuments, useReprocessDocument } from "@/features/knowledge/hooks/useKnowledge";
import { DocumentStatusBadge } from "@/features/knowledge/components/DocumentStatusBadge";
import { UploadDocumentDialog } from "@/features/knowledge/components/UploadDocumentDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { formatBytes } from "@/lib/format";
import { formatDate } from "@/lib/date";
import type { KnowledgeDocument } from "@/types";

export default function KnowledgePage() {
  const { data: documents, isLoading, isError, refetch } = useDocuments();
  const deleteDocument = useDeleteDocument();
  const reprocessDocument = useReprocessDocument();
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<KnowledgeDocument | null>(null);

  const filtered = useMemo(() => {
    if (!documents) return [];
    if (!query.trim()) return documents;
    const q = query.toLowerCase();
    return documents.filter((d) => d.name.toLowerCase().includes(q));
  }, [documents, query]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Base de Conhecimento"
          description="Documentos usados pelos seus agentes para respostas com recuperação aumentada."
          actions={<UploadDocumentDialog />}
        />

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar documentos"
            className="pl-8"
            aria-label="Pesquisar documentos"
          />
        </div>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {isError && <ErrorState description="Não foi possível carregar sua base de conhecimento." onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Nenhum documento ainda"
            description="Envie políticas, manuais ou FAQs para que seus agentes possam responder com base neles."
          />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Blocos</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{doc.name}</p>
                          {doc.status === "ERROR" && doc.errorMessage && (
                            <p className="truncate text-xs text-destructive">{doc.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.fileType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatBytes(doc.fileSizeBytes)}</TableCell>
                    <TableCell>
                      <DocumentStatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.chunkCount || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Opções para ${doc.name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {doc.status === "ERROR" && (
                            <DropdownMenuItem onSelect={() => reprocessDocument.mutate(doc.id)}>
                              <RotateCw className="size-4" />
                              Tentar novamente o processamento
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem variant="destructive" onSelect={() => setPendingDelete(doc)}>
                            <Trash2 className="size-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" será removido da base de conhecimento e de quaisquer agentes que o referenciem.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) deleteDocument.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
