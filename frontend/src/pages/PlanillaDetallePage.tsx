/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import type { Planilla } from "../types/planilla";
// Asegúrate de que el nombre coincida con tu archivo: planilla.service o planillas.service
import { PlanillasApiService } from "../services/planillas.service";
import { Header } from "../components/Header";
import { FilterBar } from "../components/FilterBar";
import { MovimientosTable } from "../components/MovimientosTable";
import { Alert } from "../components/Alert";

export const PlanillaDetallePage: React.FC = () => {
  const [planilla, setPlanilla] = useState<Planilla | null>(null);
  const [selectedCentroCosto, setSelectedCentroCosto] =
    useState<string>("TODOS");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanilla = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await PlanillasApiService.getDetallePlanilla(101);
        setPlanilla(data);
      } catch (err: any) {
        setErrorMessage(
          err.message || "Error al obtener la planilla desde la base de datos",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanilla();
  }, []);

  const centrosCosto = useMemo(() => {
    if (!planilla || !planilla.planillaDetalles) return [];
    const map = new Map<number, string>();
    planilla.planillaDetalles.forEach((det) => {
      const cc = det.empleado?.centroCosto;
      if (cc && cc.centroCostoId) {
        map.set(cc.centroCostoId, cc.nombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [planilla]);

  const movimientosFiltrados = useMemo(() => {
    if (!planilla || !planilla.planillaDetalles) return [];
    if (selectedCentroCosto === "TODOS") return planilla.planillaDetalles;
    const centroId = Number(selectedCentroCosto);
    return planilla.planillaDetalles.filter(
      (det) => det.empleado?.centroCostoId === centroId,
    );
  }, [planilla, selectedCentroCosto]);

  const totales = useMemo(() => {
    return movimientosFiltrados.reduce(
      (acc, item) => {
        const monto = Number(item.monto) || 0;
        if (item.tipo === "D") acc.debitos += monto;
        if (item.tipo === "C") acc.creditos += monto;
        return acc;
      },
      { debitos: 0, creditos: 0 },
    );
  }, [movimientosFiltrados]);

  const handleEnviarSAP = async () => {
    if (!planilla || planilla.estado !== "Aprobada" || isSending) return;

    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const respuesta = await PlanillasApiService.enviarASap(
        planilla.planillaId,
      );
      setSuccessMessage(respuesta.mensaje);
      setPlanilla((prev) => (prev ? { ...prev, estado: "EnviadaSAP" } : null));
    } catch (err: any) {
      setErrorMessage(err.message || "No fue posible completar el envío a SAP");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Cargando movimientos de planilla desde el servidor...
        </p>
      </div>
    );
  }

  if (!planilla) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm border border-red-200 text-center">
          <p className="text-red-600 font-medium">
            No se encontró información para la planilla especificada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Header
          planillaId={planilla.planillaId}
          periodo={planilla.periodo}
          estado={planilla.estado}
          isSending={isSending}
          onEnviarSAP={handleEnviarSAP}
        />

        {errorMessage && <Alert type="error" message={errorMessage} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        <FilterBar
          centrosCosto={centrosCosto}
          selectedCentroCosto={selectedCentroCosto}
          onSelectCentroCosto={setSelectedCentroCosto}
        />

        <MovimientosTable
          movimientos={movimientosFiltrados}
          totales={totales}
        />
      </div>
    </main>
  );
};
