import React from "react";
import type { FilterBarProps } from "../types/components";

export const FilterBar: React.FC<FilterBarProps> = ({
  centrosCosto,
  selectedCentroCosto,
  onSelectCentroCosto,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
      <label
        htmlFor="centroCostoSelect"
        className="text-sm font-medium text-slate-700 whitespace-nowrap"
      >
        Centro de costo:
      </label>
      <select
        id="centroCostoSelect"
        value={selectedCentroCosto}
        onChange={(e) => onSelectCentroCosto(e.target.value)}
        className="w-full md:w-72 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition"
      >
        <option value="TODOS">Todos los centros de costo</option>
        {centrosCosto.map((cc) => (
          <option key={cc.id} value={cc.id}>
            {cc.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};
