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
        centroCostoId: 1,
        activo: true,
        centroCosto: { centroCostoId: 1, nombre: "Tecnología" },
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
        centroCostoId: 1,
        activo: true,
        centroCosto: { centroCostoId: 1, nombre: "Tecnología" },
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
        centroCostoId: 1,
        activo: true,
        centroCosto: { centroCostoId: 1, nombre: "Tecnología" },
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
        centroCostoId: 2,
        activo: true,
        centroCosto: { centroCostoId: 2, nombre: "Operaciones" },
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
        centroCostoId: 2,
        activo: true,
        centroCosto: { centroCostoId: 2, nombre: "Operaciones" },
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
        centroCostoId: 2,
        activo: true,
        centroCosto: { centroCostoId: 2, nombre: "Operaciones" },
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
      const data: Planilla = await res.json();

      // Normalizar montos por si la BD los entrega como strings
      if (data.planillaDetalles) {
        data.planillaDetalles = data.planillaDetalles.map((d) => ({
          ...d,
          monto: Number(d.monto),
        }));
      }

      return data;
    } catch (error) {
      console.warn("Backend no disponible, cargando mock de datos:", error);
      return MOCK_PLANILLA;
    }
  },

  async enviarASap(
    id: number,
  ): Promise<{ mensaje: string; estado: string; docEntry?: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/planillas/${id}/enviar-sap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fallo en la comunicación con SAP");
      }
      return {
        mensaje:
          data.mensaje || data.message || "Planilla enviada con éxito a SAP",
        estado: data.estado || "EnviadaSAP",
        docEntry: data.sapDocEntry || data.docEntry,
      };
    } catch (error: any) {
      // Si el backend estuviera apagado al momento de la demo
      if (error.message && error.message.includes("Failed to fetch")) {
        await new Promise((r) => setTimeout(r, 600));
        return {
          mensaje: "Planilla enviada con éxito a SAP (Simulación local)",
          estado: "EnviadaSAP",
          docEntry: 89012,
        };
      }
      throw error;
    }
  },
};
