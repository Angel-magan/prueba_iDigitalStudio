import React from "react";
import type { MovimientosTableProps } from "../types/components";

export const MovimientosTable: React.FC<MovimientosTableProps> = ({
  movimientos,
  totales,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Empleado
              </th>
              <th scope="col" className="px-6 py-3.5">
                Centro de Costo
              </th>
              <th scope="col" className="px-6 py-3.5">
                Concepto
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Débitos
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Créditos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400 italic"
                >
                  No se encontraron movimientos para el filtro seleccionado.
                </td>
              </tr>
            ) : (
              movimientos.map((mov) => {
                const montoNum = Number(mov.monto);
                return (
                  <tr
                    key={mov.detalleId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {mov.empleado.nombre}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {mov.empleado.centroCosto?.nombre || "General"}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{mov.concepto}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {mov.tipo === "D" ? `$${montoNum.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {mov.tipo === "C" ? `$${montoNum.toFixed(2)}` : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-slate-800">
                Totales Generales
              </td>
              <td className="px-6 py-4 text-right text-blue-700">
                ${totales.debitos.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right text-emerald-700">
                ${totales.creditos.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
