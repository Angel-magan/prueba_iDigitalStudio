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
export declare class SapService {
    /**
     * Simula la sincronización hacia SAP Service Layer
     */
    enviarAsientoPlanilla(payload: SapDocumentPayload): Promise<SapResponse>;
}
export declare const sapService: SapService;
//# sourceMappingURL=sap.service.d.ts.map