import type { PlanillaDetalle, TotalesContables } from "./planilla";

export interface HeaderProps {
  planillaId: number;
  periodo: string;
  estado: string;
  isSending: boolean;
  onEnviarSAP: () => void;
}

export interface CentroCostoOption {
  id: number;
  nombre: string;
}

export interface FilterBarProps {
  centrosCosto: CentroCostoOption[];
  selectedCentroCosto: string;
  onSelectCentroCosto: (value: string) => void;
}

export interface MovimientosTableProps {
  movimientos: PlanillaDetalle[];
  totales: TotalesContables;
}

export interface AlertProps {
  type: "error" | "success";
  message: string;
}
