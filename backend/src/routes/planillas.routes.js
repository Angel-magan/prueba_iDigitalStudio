"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const planillas_controller_1 = require("../controllers/planillas.controller");
const router = (0, express_1.Router)();
// Endpoint solicitado por la prueba
router.post("/planillas/:id/enviar-sap", (req, res) => planillas_controller_1.planillasController.enviarSap(req, res));
// Endpoint para consultar datos en el frontend
router.get("/planillas/:id", (req, res) => planillas_controller_1.planillasController.getDetalle(req, res));
exports.default = router;
//# sourceMappingURL=planillas.routes.js.map