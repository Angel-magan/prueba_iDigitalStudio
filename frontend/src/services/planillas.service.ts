/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Planilla } from "../types/planilla";

const API_BASE_URL = "http://localhost:3001/api";

const MOCK_PLANILLA: Planilla = {
  planillaId: 101,
  periodo: "2026-09",
  estado: "Aprobada",
  planillaDetalles: [
    {
      detalleId: 1,
      planillaId: 101,
      empleadoId: 1,
      concepto: "Salario Base Quincenal",
      monto: 1250.0,
      tipo: "D",
      empleado: {
        empleadoId: 1,
        nombre: "Carlos Mendoza",
        centroCostoId: 10,
        activo: true,
        centroCosto: { centroCostoId: 10, nombre: "Tecnología" },
      },
    },
    {
      detalleId: 2,
      planillaId: 101,
      empleadoId: 1,
      concepto: "Retención de Renta",
      monto: 125.0,
      tipo: "C",
      empleado: {
        empleadoId: 1,
        nombre: "Carlos Mendoza",
        centroCostoId: 10,
        activo: true,
        centroCosto: { centroCostoId: 10, nombre: "Tecnología" },
      },
    },
    {
      detalleId: 3,
      planillaId: 101,
      empleadoId: 1,
      concepto: "Pago Neto en Banco",
      monto: 1125.0,
      tipo: "C",
      empleado: {
        empleadoId: 1,
        nombre: "Carlos Mendoza",
        centroCostoId: 10,
        activo: true,
        centroCosto: { centroCostoId: 10, nombre: "Tecnología" },
      },
    },
    {
      detalleId: 4,
      planillaId: 101,
      empleadoId: 2,
      concepto: "Salario Base Quincenal",
      monto: 850.0,
      tipo: "D",
      empleado: {
        empleadoId: 2,
        nombre: "María Elena Ramos",
        centroCostoId: 20,
        activo: true,
        centroCosto: { centroCostoId: 20, nombre: "Operaciones" },
      },
    },
    {
      detalleId: 5,
      planillaId: 101,
      empleadoId: 2,
      concepto: "Retención de Renta",
      monto: 85.0,
      tipo: "C",
      empleado: {
        empleadoId: 2,
        nombre: "María Elena Ramos",
        centroCostoId: 20,
        activo: true,
        centroCosto: { centroCostoId: 20, nombre: "Operaciones" },
      },
    },
    {
      detalleId: 6,
      planillaId: 101,
      empleadoId: 2,
      concepto: "Pago Neto en Banco",
      monto: 765.0,
      tipo: "C",
      empleado: {
        empleadoId: 2,
        nombre: "María Elena Ramos",
        centroCostoId: 20,
        activo: true,
        centroCosto: { centroCostoId: 20, nombre: "Operaciones" },
      },
    },
  ],
};

export const PlanillasApiService = {
  async getDetallePlanilla(id: number): Promise<Planilla> {
    try {
      const res = await fetch(`${API_BASE_URL}/planillas/${id}`);
      if (!res.ok) {
        throw new Error(`Error en servidor: HTTP ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.warn("Backend no disponible, cargando mock de datos:", error);
      return MOCK_PLANILLA;
    }
  },

  async enviarASap(id: number): Promise<{ mensaje: string; estado: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/planillas/${id}/enviar-sap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fallo en la comunicación con SAP");
      }
      return data;
    } catch (error: any) {
      if (error.message.includes("Failed to fetch")) {
        await new Promise((r) => setTimeout(r, 600));
        return {
          mensaje: "Planilla enviada con éxito a SAP (Simulación local)",
          estado: "EnviadaSAP",
        };
      }
      throw error;
    }
  },
};
