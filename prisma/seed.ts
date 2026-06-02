// Seed script para poblar la base de datos con datos de ejemplo.
// Este script inicializa el store en memoria con usuarios, turnos y solicitudes.

import { resetData } from "../src/lib/data";

console.log("Inicializando datos de ejemplo...");
resetData();
console.log("✓ Datos cargados:");
console.log("  - 1 administrador");
console.log("  - 1 supervisor");
console.log("  - 6 trabajadores en 2 equipos (A y B)");
console.log("  - Turnos para la semana actual");
console.log("  - 1 solicitud pendiente");
console.log("");
console.log("Cuentas de demostración:");
console.log("  admin@empresa.com / admin123");
console.log("  supervisor@empresa.com / super123");
console.log("  maria@empresa.com / worker123 (y demás trabajadores)");
