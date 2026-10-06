"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sapService = exports.SapService = void 0;
class SapService {
    /**
     * Simula la sincronización hacia SAP Service Layer
     */
    async enviarAsientoPlanilla(payload) {
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
exports.SapService = SapService;
exports.sapService = new SapService();
//# sourceMappingURL=sap.service.js.map