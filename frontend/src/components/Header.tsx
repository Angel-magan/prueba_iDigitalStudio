import React from "react";
import type { HeaderProps } from "../types/components";

export const Header: React.FC<HeaderProps> = ({
  planillaId,
  periodo,
  estado,
  isSending,
  onEnviarSAP,
}) => {
  const isAprobada = estado === "Aprobada";
  const isBotonHabilitado = isAprobada && !isSending;

  const badgeStyles: Record<string, string> = {
    Aprobada: "bg-emerald-100 text-emerald-800 border-emerald-300",
    EnviadaSAP: "bg-indigo-100 text-indigo-800 border-indigo-300",
    Borrador: "bg-amber-100 text-amber-800 border-amber-300",
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Detalle de Planilla #{planillaId}
          </h1>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              badgeStyles[estado] || "bg-slate-100 text-slate-800"
            }`}
          >
            {estado}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Periodo de nómina:{" "}
          <span className="font-semibold text-slate-700">{periodo}</span>
        </p>
      </div>

      <div>
        <button
          onClick={onEnviarSAP}
          disabled={!isBotonHabilitado}
          className={`w-full md:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm ${
            isBotonHabilitado
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
          }`}
        >
          {isSending ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Enviando a SAP...
            </span>
          ) : (
            "Enviar a SAP"
          )}
        </button>
      </div>
    </div>
  );
};
