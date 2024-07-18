import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
// import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  actualizarProveedor,
  crearComprobante,
  crearProveedor,
  eliminarComprobante,
  eliminarProveedor,
  getProveedor,
  getProveedorById,
  getProveedores,
} from "../controllers/proveedores.controllers.js";

const router = Router();

router.get("/proveedores", isAuth, getProveedores);

router.get("/proveedores/:id", isAuth, getProveedorById);

router.get("/proveedores-proveedor/:proveedor", isAuth, getProveedor);

router.post("/proveedores", isAuth, crearProveedor);

router.put("/proveedores/:id", isAuth, actualizarProveedor);

router.delete("/proveedores/:id", isAuth, eliminarProveedor);

router.post("/proveedores/:id/comprobantes", isAuth, crearComprobante);

router.delete(
  "/proveedores/:id/comprobantes/:comprobanteId",
  isAuth,
  eliminarComprobante
);

export default router;
