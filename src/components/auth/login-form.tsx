"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Briefcase, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { loginAction } from "@/app/actions";

const DEMO_ACCOUNTS = [
  { email: "admin@empresa.com", password: "admin123", label: "Administrador" },
  { email: "supervisor@empresa.com", password: "super123", label: "Supervisor" },
  { email: "maria@empresa.com", password: "worker123", label: "Trabajador" },
];

export function LoginForm() {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.append("email", values.email);
    fd.append("password", values.password);
    const result = await loginAction(undefined, fd);
    if (result && "ok" in result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    }
  }

  function fillAccount(email: string, password: string) {
    form.setValue("email", email);
    form.setValue("password", password);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-2xl border-border/60 backdrop-blur">
          <CardHeader className="text-center space-y-3 pb-2">
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground shadow-lg"
            >
              <Briefcase className="h-7 w-7" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl">Bienvenido de vuelta</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  autoComplete="email"
                  {...form.register("email")}
                  aria-invalid={!!form.formState.errors.email}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...form.register("password")}
                  aria-invalid={!!form.formState.errors.password}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              {error && (
                <p className="text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Ingresar
                  </>
                )}
              </Button>
            </form>

            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Cuentas de demostración</p>
              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => fillAccount(a.email, a.password)}
                    className="w-full text-left text-xs rounded-md border bg-card hover:bg-accent/50 transition-colors px-2.5 py-1.5 cursor-pointer"
                  >
                    <span className="font-medium">{a.label}</span>
                    <span className="text-muted-foreground ml-2">{a.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
