import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  crearRevestimiento,
  actualizarRevestimiento,
  eliminarRevestimiento,
  getRevestimientoById,
  getRevestimientos,
} from "../controllers/revestimiento.controllers.js"; // Change to the correct controller

const router = Router();

// Obtener todos los revestimientos
router.get("/revestimientos", isAuth, isAdmin, getRevestimientos);

// Obtener un revestimiento por su ID
router.get("/revestimientos/:id", isAuth, isAdmin, getRevestimientoById);

// Crear un nuevo revestimiento
router.post("/revestimientos", isAuth, isAdmin, crearRevestimiento);

// Actualizar un revestimiento por su ID
router.put("/revestimientos/:id", isAuth, isAdmin, actualizarRevestimiento);

// Eliminar un revestimiento por su ID
router.delete("/revestimientos/:id", isAuth, isAdmin, eliminarRevestimiento);

export default router;
