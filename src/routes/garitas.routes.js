import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  crearGarita,
  actualizarGarita,
  eliminarGarita,
  getGaritaById,
  getGaritas,
} from "../controllers/garitas.controllers.js";

const router = Router();

// Obtener todas las garitas
router.get("/garitas", isAuth, isAdmin, getGaritas);

// Obtener una garita por su ID
router.get("/garitas/:id", isAuth, isAdmin, getGaritaById);

// Crear una nueva garita
router.post("/garitas", isAuth, isAdmin, crearGarita);

// Actualizar una garita por su ID
router.put("/garitas/:id", isAuth, isAdmin, actualizarGarita);

// Eliminar una garita por su ID
router.delete("/garitas/:id", isAuth, isAdmin, eliminarGarita);

export default router;
