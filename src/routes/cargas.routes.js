import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  crearCarga,
  actualizarCarga,
  eliminarCarga,
  getCargaById,
  getCargas,
} from "../controllers/cargas.controllers.js";

const router = Router();

// Obtener todas las cargas
router.get("/cargas", isAuth, isAdmin, getCargas);

// Obtener una carga por su ID
router.get("/cargas/:id", isAuth, isAdmin, getCargaById);

// Crear una nueva carga
router.post("/cargas", isAuth, isAdmin, crearCarga);

// Actualizar una carga por su ID
router.put("/cargas/:id", isAuth, isAdmin, actualizarCarga);

// Eliminar una carga por su ID
router.delete("/cargas/:id", isAuth, isAdmin, eliminarCarga);

export default router;
