import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full grid place-items-center p-4">
      <div className="text-center space-y-3 max-w-md">
        <p className="text-7xl font-bold tracking-tight text-primary">404</p>
        <h1 className="text-2xl font-semibold">Página no encontrada</h1>
        <p className="text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="pt-2">
          <Button asChild>
            <Link href="/dashboard">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
