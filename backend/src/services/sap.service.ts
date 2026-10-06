export interface SapDocumentPayload {
  planillaId: number;
  periodo: string;
  totalDebitos: number;
  totalCreditos: number;
  lineas: Array<{
    empleadoId: number;
    concepto: string;
    monto: number;
    tipo: "D" | "C";
  }>;
}

export interface SapResponse {
  docEntry: number;
  docNum: number;
  status: "SUCCESS" | "ERROR";
  message: string;
}

export class SapService {
  /**
   * Simula la sincronización hacia SAP Service Layer
   */
  public async enviarAsientoPlanilla(
    payload: SapDocumentPayload,
  ): Promise<SapResponse> {
    // Simular latencia de red de 500ms
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Retorna confirmación de creación de asiento contable
    return {
      docEntry: Math.floor(100000 + Math.random() * 900000),
      docNum: Math.floor(1000 + Math.random() * 9000),
      status: "SUCCESS",
      message: `Documento contable registrado en SAP exitosamente para el periodo ${payload.periodo}`,
    };
  }
}

export const sapService = new SapService();
