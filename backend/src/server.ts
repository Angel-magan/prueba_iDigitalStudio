import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import planillasRoutes from "./routes/planillas.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Registro de endpoints
app.use("/api", planillasRoutes);

app.listen(PORT, () => {
  console.log(`Backend de Planillas activo en http://localhost:${PORT}`);
});

export default app;
