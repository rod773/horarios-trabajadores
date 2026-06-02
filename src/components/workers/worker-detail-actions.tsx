"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkerForm } from "./worker-form";
import { deleteWorkerAction } from "@/app/actions";
import type { User } from "@/lib/types";

export function WorkerDetailActions({ worker }: { worker: User }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);

  async function onDelete() {
    if (!confirm(`¿Eliminar a ${worker.name}? Se eliminarán también sus turnos.`)) return;
    const r = await deleteWorkerAction(worker.id);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Trabajador eliminado");
    router.push("/trabajadores");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      <Button variant="outline" onClick={() => setEditOpen(true)}>
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
      <Button variant="outline" onClick={onDelete} className="text-destructive">
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar trabajador</DialogTitle>
            <DialogDescription>Modifica los datos de {worker.name}</DialogDescription>
          </DialogHeader>
          <WorkerForm
            worker={worker}
            onDone={() => {
              setEditOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
