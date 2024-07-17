import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  ActualizarSucursal,
  EliminarSucursal,
  crearSucursal,
  getSucursalById,
  getSucursales,
} from "../controllers/sucursal.controllers.js";

const router = Router();

// Obtener todos los contratos
router.get("/sucursal", isAuth, isAdmin, getSucursales);

// Obtener un contrato por su ID
router.get("/sucursal/:id", isAuth, isAdmin, getSucursalById);

// Crear un nuevo contrato
router.post("/sucursal", isAuth, isAdmin, crearSucursal);

// Actualizar un contrato por su ID
router.put("/sucursal/:id", isAuth, isAdmin, ActualizarSucursal);

// Eliminar un contrato por su ID
router.delete("/sucursal/:id", isAuth, isAdmin, EliminarSucursal);

export default router;
