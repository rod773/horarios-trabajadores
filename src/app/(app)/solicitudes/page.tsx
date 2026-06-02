import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getRequests, getShifts, getUsers } from "@/lib/data";
import { RequestForm, RequestsList } from "@/components/requests/request-form";
import { FadeIn } from "@/components/animations/page-transition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SolicitudesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allRequests = getRequests();
  const users = getUsers();
  const shifts = getShifts();
  const myRequests = allRequests.filter((r) => r.requesterId === user.id);
  const allVisible = user.role === "WORKER" ? myRequests : allRequests;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Solicitudes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los cambios de turno, ajustes y vacaciones
          </p>
        </div>
      </FadeIn>

      <RequestForm shifts={shifts} currentUserId={user.id} />

      <Tabs defaultValue={user.role === "WORKER" ? "mine" : "all"} className="w-full">
        <TabsList>
          {user.role !== "WORKER" && <TabsTrigger value="all">Todas ({allVisible.length})</TabsTrigger>}
          <TabsTrigger value="mine">Mis solicitudes ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({allVisible.filter((r) => r.status === "PENDIENTE").length})
          </TabsTrigger>
        </TabsList>
        {user.role !== "WORKER" && (
          <TabsContent value="all" className="mt-4">
            <RequestsList
              requests={allVisible}
              users={users}
              shifts={shifts}
              currentRole={user.role}
            />
          </TabsContent>
        )}
        <TabsContent value="mine" className="mt-4">
          <RequestsList
            requests={myRequests}
            users={users}
            shifts={shifts}
            currentRole={user.role}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <RequestsList
            requests={allVisible.filter((r) => r.status === "PENDIENTE")}
            users={users}
            shifts={shifts}
            currentRole={user.role}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
