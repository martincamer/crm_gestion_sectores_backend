import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  crearInforme,
  actualizarInforme,
  eliminarInforme,
  getInformeById,
  getInformes,
  agregarDatosAContratos,
  obtenerContratoPorId,
  actualizarContratoPorId,
  eliminarContratoPorId,
} from "../controllers/informes.controllers.js";

const router = Router();

// Obtener todos los informes
router.get("/informes", isAuth, isAdmin, getInformes);

// Obtener un informe por su ID
router.get("/informes/:id", isAuth, isAdmin, getInformeById);

// Crear un nuevo informe
router.post("/informes", isAuth, isAdmin, crearInforme);

// Actualizar un informe por su ID
router.put("/informes/:id", isAuth, isAdmin, actualizarInforme);

// Eliminar un informe por su ID
router.delete("/informes/:id", isAuth, isAdmin, eliminarInforme);

router.post("/informes/:id/contratos", isAuth, isAdmin, agregarDatosAContratos);

router.get(
  "/informes/:informeId/contratos/:contratoId",
  isAuth,
  obtenerContratoPorId
);

router.put(
  "/informes/:informeId/contratos/:contratoId",
  isAuth,
  actualizarContratoPorId
);

router.delete(
  "/informes/:informeId/contratos/:contratoId",
  eliminarContratoPorId
);

export default router;
