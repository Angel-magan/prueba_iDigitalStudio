"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planillasController = exports.PlanillasController = void 0;
const planillas_service_1 = require("../services/planillas.service");
class PlanillasController {
    async enviarSap(req, res) {
        const rawId = req.params.id;
        const id = typeof rawId === "string" ? parseInt(rawId, 10) : Number.NaN;
        if (isNaN(id) || id <= 0) {
            res
                .status(400)
                .json({
                error: "El parámetro :id debe ser un entero positivo válido.",
            });
            return;
        }
        try {
            const resultado = await planillas_service_1.planillasService.enviarASap(id);
            res.status(200).json(resultado);
        }
        catch (error) {
            if (error instanceof planillas_service_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error("Error no controlado en enviarSap:", error);
            res
                .status(500)
                .json({
                error: "Error interno del servidor al procesar el envío a SAP.",
            });
        }
    }
    async getDetalle(req, res) {
        const rawId = req.params.id;
        const id = typeof rawId === "string" ? parseInt(rawId, 10) : Number.NaN;
        if (isNaN(id) || id <= 0) {
            res
                .status(400)
                .json({
                error: "El parámetro :id debe ser un entero positivo válido.",
            });
            return;
        }
        try {
            const planilla = await planillas_service_1.planillasService.obtenerDetalle(id);
            res.status(200).json(planilla);
        }
        catch (error) {
            if (error instanceof planillas_service_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Error al consultar la planilla." });
        }
    }
}
exports.PlanillasController = PlanillasController;
exports.planillasController = new PlanillasController();
//# sourceMappingURL=planillas.controller.js.map