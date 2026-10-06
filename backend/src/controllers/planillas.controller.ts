import { Request, Response } from "express";
import { planillasService, AppError } from "../services/planillas.service";

export class PlanillasController {
  public async enviarSap(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id;
    const id = typeof rawId === "string" ? parseInt(rawId, 10) : Number.NaN;

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        error: "El parámetro :id debe ser un entero positivo válido.",
      });
      return;
    }

    try {
      const resultado = await planillasService.enviarASap(id);
      res.status(200).json(resultado);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error("Error no controlado en enviarSap:", error);
      res.status(500).json({
        error: "Error interno del servidor al procesar el envío a SAP.",
      });
    }
  }

  public async getDetalle(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id;
    const id = typeof rawId === "string" ? parseInt(rawId, 10) : Number.NaN;

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        error: "El parámetro :id debe ser un entero positivo válido.",
      });
      return;
    }

    try {
      const planilla = await planillasService.obtenerDetalle(id);
      res.status(200).json(planilla);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Error al consultar la planilla." });
    }
  }
}

export const planillasController = new PlanillasController();
