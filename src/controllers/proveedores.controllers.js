import { pool } from "../db.js";

import { v4 as uuidv4 } from "uuid";

// Obtener todos los proveedores
export const getProveedores = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM proveedores");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron proveedores" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un proveedor por su ID
export const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM proveedores WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún proveedor con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener proveedor por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un proveedor
export const getProveedor = async (req, res) => {
  try {
    const { proveedor } = req.params;
    const result = await pool.query(
      "SELECT * FROM proveedores WHERE proveedor = $1", // Consulta SQL para buscar por el campo 'proveedor'
      [proveedor]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún proveedor con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener proveedor por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearProveedor = async (req, res, next) => {
  const {
    proveedor,
    localidad_proveedor,
    provincia_proveedor,
    saldo,
    telefono,
    email,
  } = req.body;
  const { username, userRole, localidad, sucursal, sector, provincia } = req;

  // Valores predeterminados
  const comprobantes = "[]";

  try {
    // Insertar el nuevo proveedor
    const insertResult = await pool.query(
      "INSERT INTO proveedores (proveedor, localidad_proveedor, provincia_proveedor, saldo, telefono, email, comprobantes, localidad, provincia, sector, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13) RETURNING *",
      [
        proveedor,
        localidad_proveedor,
        provincia_proveedor,
        saldo,
        telefono,
        email,
        comprobantes,
        localidad,
        provincia,
        sector,
        sucursal,
        username,
        userRole,
      ]
    );

    const selectResult = await pool.query(
      "SELECT * FROM proveedores WHERE sector = $1 AND localidad = $2",
      [sector, localidad]
    );

    res.status(201).json({
      nuevoProveedor: insertResult.rows[0],
      todosLosProveedores: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un proveedor con ese nombre",
      });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearComprobante = async (req, res) => {
  const { id } = req.params; // ID del proveedor
  const { comprobante } = req.body; // Comprobante enviado desde el frontend
  const { sector, localidad } = req;

  try {
    // Generar un ID aleatorio usando uuid
    const comprobanteId = uuidv4();

    // Obtener la fecha actual
    const fechaActual = new Date().toISOString(); // Formato ISO 8601: 'YYYY-MM-DDTHH:mm:ss.sssZ'

    // Obtener el proveedor según el ID
    const proveedorResult = await pool.query(
      "SELECT * FROM proveedores WHERE id = $1",
      [id]
    );

    if (proveedorResult.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    let proveedor = proveedorResult.rows[0];

    // Obtener el arreglo de comprobantes actuales y agregar el nuevo comprobante
    let comprobantesArray = JSON.parse(proveedor.comprobantes || "[]");

    // Extraer el total del comprobante
    const totalComprobante = parseFloat(comprobante.total);

    // Sumar el total del comprobante al haber actual del proveedor
    const nuevoTotal = parseFloat(proveedor.saldo) - totalComprobante;

    console.log(proveedor.saldo);

    comprobantesArray.push({
      ...comprobante,
      id: comprobanteId,
      fecha: fechaActual,
    });

    // Actualizar el proveedor con el nuevo arreglo de comprobantes y el nuevo haber
    const result = await pool.query(
      "UPDATE proveedores SET comprobantes = $1, saldo = $2 WHERE id = $3 RETURNING *",
      [JSON.stringify(comprobantesArray), nuevoTotal, id]
    );

    proveedor = result.rows[0]; // Actualizar proveedor con los datos

    const selectResult = await pool.query(
      "SELECT * FROM proveedores WHERE sector = $1 AND localidad = $2",
      [sector, localidad]
    );

    res.status(201).json({
      proveedorActualizado: proveedor,
      todosLosProveedores: selectResult.rows,
    });
    // res.status(200).json({
    //   proveedorActualizado: proveedor,
    //   todosLosProveedores: result.rows, // Opcional: puedes devolver todos los proveedores actualizados
    // });
  } catch (error) {
    console.error("Error al crear comprobante:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const eliminarComprobante = async (req, res) => {
  const { id } = req.params; // ID del proveedor
  const { comprobanteId } = req.params; // ID del comprobante a eliminar

  try {
    // Obtener el proveedor según el ID
    const proveedorResult = await pool.query(
      "SELECT * FROM proveedores WHERE id = $1",
      [id]
    );

    if (proveedorResult.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    let proveedor = proveedorResult.rows[0];

    // Obtener el arreglo de comprobantes actuales
    let comprobantesArray = JSON.parse(proveedor.comprobantes || "[]");

    // Encontrar el índice del comprobante a eliminar
    const index = comprobantesArray.findIndex(
      (comp) => comp.id === comprobanteId
    );

    if (index === -1) {
      return res.status(404).json({
        message: "No se encontró ningún comprobante con ese ID",
      });
    }

    // Obtener el comprobante a eliminar
    const comprobanteEliminado = comprobantesArray[index];

    // Calcular el total del comprobante eliminado
    const totalEliminado = parseFloat(comprobanteEliminado.total);

    // Eliminar el comprobante del arreglo
    comprobantesArray = comprobantesArray.filter(
      (comp) => comp.id !== comprobanteId
    );

    // Sumar el total eliminado al haber del proveedor
    const nuevoHaber = parseFloat(proveedor.haber) + totalEliminado;

    // Actualizar el proveedor con el nuevo arreglo de comprobantes y el nuevo haber
    const result = await pool.query(
      "UPDATE proveedores SET comprobantes = $1, haber = $2 WHERE id = $3 RETURNING *",
      [JSON.stringify(comprobantesArray), nuevoTotal, id]
    );

    proveedor = result.rows[0]; // Actualizar proveedor con los datos actualizados

    res.status(200).json({
      proveedorActualizado: proveedor,
      todosLosProveedores: result.rows, // Opcional: puedes devolver todos los proveedores actualizados
    });
  } catch (error) {
    console.error("Error al eliminar comprobante:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarProveedor = async (req, res) => {
  const { id } = req.params;

  const {
    proveedor,
    localidad_proveedor,
    provincia_proveedor,
    email,
    telefono,
    saldo,
  } = req.body;

  const { username, userRole, localidad, sector } = req;

  try {
    const result = await pool.query(
      "UPDATE proveedores SET proveedor = $1, localidad_proveedor = $2, provincia_proveedor = $3, saldo = $4, email = $5, telefono = $6,usuario = $7, role_id = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *",
      [
        proveedor,
        localidad_proveedor,
        provincia_proveedor,
        saldo,
        email,
        telefono,
        username,
        userRole,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    // Obtener todos los proveedores que coincidan con el usuario y localidad
    const todosLosProveedores = await pool.query(
      "SELECT * FROM proveedores WHERE sector = $1 AND localidad = $2",
      [sector, localidad]
    );

    res.status(200).json({
      updatedProveedor: result.rows[0],
      todosLosProveedores: todosLosProveedores.rows,
    });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un proveedor
export const eliminarProveedor = async (req, res) => {
  const { id } = req.params;
  const { sector, localidad } = req;

  try {
    const result = await pool.query("DELETE FROM proveedores WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    // Obtener todos los proveedores que coincidan con el usuario y localidad después de la eliminación
    const selectResult = await pool.query(
      "SELECT * FROM proveedores WHERE sector = $1 AND localidad = $2",
      [sector, localidad]
    );

    res.status(201).json({
      nuevoProveedor: result.rows[0],
      todosLosProveedores: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
