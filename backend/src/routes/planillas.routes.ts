import { Router } from "express";
import { planillasController } from "../controllers/planillas.controller";

const router = Router();

// Endpoint solicitado por la prueba
router.post("/planillas/:id/enviar-sap", (req, res) =>
  planillasController.enviarSap(req, res),
);

// Endpoint para consultar datos en el frontend
router.get("/planillas/:id", (req, res) =>
  planillasController.getDetalle(req, res),
);

export default router;
