export interface CentroCosto {
  centroCostoId: number;
  nombre: string;
}

export interface Empleado {
  empleadoId: number;
  nombre: string;
  centroCostoId: number;
  activo: boolean;
  centroCosto?: CentroCosto;
}

export interface PlanillaDetalle {
  detalleId: number;
  planillaId: number;
  empleadoId: number;
  concepto: string;
  monto: number;
  tipo: "D" | "C";
  empleado: Empleado;
}

export interface Planilla {
  planillaId: number;
  periodo: string;
  estado: "Borrador" | "Aprobada" | "EnviadaSAP";
  planillaDetalles: PlanillaDetalle[];
}

export interface TotalesContables {
  debitos: number;
  creditos: number;
}
