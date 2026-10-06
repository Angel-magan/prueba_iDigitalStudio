export declare class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare class PlanillasService {
    enviarASap(planillaId: number): Promise<{
        mensaje: string;
        planillaId: number;
        estado: string;
        sapDetalle: import("./sap.service").SapResponse;
    }>;
    obtenerDetalle(planillaId: number): Promise<{
        planillaDetalles: ({
            empleado: {
                centroCosto: {
                    nombre: string;
                    centroCostoId: number;
                };
            } & {
                empleadoId: number;
                nombre: string;
                centroCostoId: number;
                activo: boolean;
            };
        } & {
            planillaId: number;
            detalleId: number;
            empleadoId: number;
            concepto: string;
            monto: import("@prisma/client/runtime/library").Decimal;
            tipo: string;
        })[];
    } & {
        planillaId: number;
        periodo: string;
        estado: string;
    }>;
}
export declare const planillasService: PlanillasService;
//# sourceMappingURL=planillas.service.d.ts.map