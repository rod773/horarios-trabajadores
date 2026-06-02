"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MoreHorizontal } from "lucide-react";
import { WorkerForm } from "./worker-form";
import { deleteWorkerAction } from "@/app/actions";
import { ROLE_LABELS, type User } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function WorkersTable({ workers }: { workers: User[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<User | null>(null);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.email.toLowerCase().includes(query.toLowerCase()) ||
      (w.team ?? "").toLowerCase().includes(query.toLowerCase())
  );

  async function onDelete(w: User) {
    if (!confirm(`¿Eliminar a ${w.name}? Se eliminarán también sus turnos.`)) return;
    const r = await deleteWorkerAction(w.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Trabajador eliminado");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle>Trabajadores</CardTitle>
          <CardDescription>Gestiona los miembros del equipo y sus perfiles</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 w-full sm:w-56 h-10 sm:h-9"
            />
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="h-10 sm:h-9">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo trabajador</DialogTitle>
                <DialogDescription>
                  Crea un nuevo miembro. La contraseña inicial será <code>worker123</code>.
                </DialogDescription>
              </DialogHeader>
              <WorkerForm
                onDone={() => {
                  setOpenCreate(false);
                  router.refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserX className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No se encontraron trabajadores</p>
          </div>
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Rol</TableHead>
                <TableHead className="hidden lg:table-cell">Equipo</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Horas/sem</TableHead>
                <TableHead className="w-14 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <Link href={`/trabajadores/${w.id}`} className="flex items-center gap-3 group">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>{initials(w.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium group-hover:underline truncate max-w-[180px]">{w.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden truncate max-w-[180px]">{w.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{w.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{ROLE_LABELS[w.role]}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {w.team || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right tabular-nums">
                    {w.workerProfile?.horasObjetivoSemanal ?? 40}h
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8" aria-label="Acciones">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(w);
                            setOpenEdit(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onDelete(w)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={openEdit}
        onOpenChange={(o) => {
          setOpenEdit(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar trabajador</DialogTitle>
            <DialogDescription>Modifica los datos del trabajador</DialogDescription>
          </DialogHeader>
          {editing && (
            <WorkerForm
              worker={editing}
              onDone={() => {
                setOpenEdit(false);
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
