"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planillasService = exports.PlanillasService = exports.AppError = void 0;
const client_1 = require("@prisma/client");
const sap_service_1 = require("./sap.service");
const prisma = new client_1.PrismaClient();
// Conjunto en memoria para evitar llamadas simultáneas paralelas a la misma planilla
const planillasEnProceso = new Set();
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
class PlanillasService {
    async enviarASap(planillaId) {
        // 1. Protección contra concurrencia / doble clic
        if (planillasEnProceso.has(planillaId)) {
            throw new AppError(409, `La planilla #${planillaId} ya tiene un proceso de sincronización con SAP en curso.`);
        }
        planillasEnProceso.add(planillaId);
        try {
            // 2. Validación de existencia y estado de la planilla
            const planilla = await prisma.planillas.findUnique({
                where: { planillaId },
                include: {
                    planillaDetalles: true,
                },
            });
            if (!planilla) {
                throw new AppError(404, `No se encontró la planilla con ID #${planillaId}.`);
            }
            if (planilla.estado === "EnviadaSAP") {
                throw new AppError(409, `La planilla #${planillaId} ya fue enviada previamente a SAP.`);
            }
            if (planilla.estado !== "Aprobada") {
                throw new AppError(400, `La planilla debe estar en estado 'Aprobada' para enviarse a SAP. Estado actual: '${planilla.estado}'.`);
            }
            if (planilla.planillaDetalles.length === 0) {
                throw new AppError(400, `La planilla #${planillaId} no contiene líneas de detalle.`);
            }
            // 3. Preparación del payload contable
            let totalDebitos = 0;
            let totalCreditos = 0;
            const lineasSap = planilla.planillaDetalles.map((det) => {
                const montoNum = Number(det.monto);
                if (det.tipo === "D")
                    totalDebitos += montoNum;
                if (det.tipo === "C")
                    totalCreditos += montoNum;
                return {
                    empleadoId: det.empleadoId,
                    concepto: det.concepto,
                    monto: montoNum,
                    tipo: det.tipo,
                };
            });
            // 4. Envío a SAP (Mock)
            const respuestaSap = await sap_service_1.sapService.enviarAsientoPlanilla({
                planillaId: planilla.planillaId,
                periodo: planilla.periodo,
                totalDebitos,
                totalCreditos,
                lineas: lineasSap,
            });
            // 5. Transacción atómica en base de datos con Prisma
            const planillaActualizada = await prisma.$transaction(async (tx) => {
                const estadoActual = await tx.planillas.findUnique({
                    where: { planillaId },
                    select: { estado: true },
                });
                if (estadoActual?.estado !== "Aprobada") {
                    throw new AppError(409, `Conflicto: La planilla cambió de estado durante el proceso (Estado: ${estadoActual?.estado}).`);
                }
                return tx.planillas.update({
                    where: { planillaId },
                    data: {
                        estado: "EnviadaSAP",
                    },
                });
            });
            return {
                mensaje: "Planilla sincronizada con SAP exitosamente.",
                planillaId: planillaActualizada.planillaId,
                estado: planillaActualizada.estado,
                sapDetalle: respuestaSap,
            };
        }
        finally {
            // Liberar el bloqueo concurrente
            planillasEnProceso.delete(planillaId);
        }
    }
    // Método complementario para alimentar la vista del frontend
    async obtenerDetalle(planillaId) {
        const planilla = await prisma.planillas.findUnique({
            where: { planillaId },
            include: {
                planillaDetalles: {
                    include: {
                        empleado: {
                            include: {
                                centroCosto: true,
                            },
                        },
                    },
                },
            },
        });
        if (!planilla) {
            throw new AppError(404, `No se encontró la planilla con ID #${planillaId}.`);
        }
        return planilla;
    }
}
exports.PlanillasService = PlanillasService;
exports.planillasService = new PlanillasService();
//# sourceMappingURL=planillas.service.js.map