import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  crearContrato,
  actualizarContrato,
  eliminarContrato,
  getContratoById,
  getContratos,
  actualizarDatosContrato,
} from "../controllers/contratos.controllers.js";

const router = Router();

// Obtener todos los contratos
router.get("/contratos", isAuth, isAdmin, getContratos);

// Obtener un contrato por su ID
router.get("/contratos/:id", isAuth, isAdmin, getContratoById);

// Crear un nuevo contrato
router.post("/contratos", isAuth, isAdmin, crearContrato);

// Actualizar un contrato por su ID
router.put("/contratos/:id", isAuth, isAdmin, actualizarContrato);

// Eliminar un contrato por su ID
router.delete("/contratos/:id", isAuth, isAdmin, eliminarContrato);

router.put("/contratos/:id/datos", isAuth, isAdmin, actualizarDatosContrato); // Nueva ruta para actualizar solo los datos de un contrato

export default router;
