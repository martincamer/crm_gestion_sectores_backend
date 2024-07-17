import { pool } from "../db.js";

export const getSucursales = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM sucursal");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron sucursales" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un contrato por su ID
export const getSucursalById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM sucursal WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún contrato con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener contrato por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearSucursal = async (req, res, next) => {
  const { nombre } = req.body;

  const { username, userRole, localidad, provincia, sector, sucursal } = req;

  try {
    const insertResult = await pool.query(
      "INSERT INTO sucursal (nombre, localidad, usuario, role_id, sector, provincia,sucursal) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nombre, localidad, username, userRole, sector, provincia, sucursal]
    );

    const selectResult = await pool.query("SELECT * FROM sucursal");

    res.status(201).json({
      nuevaSucursal: insertResult.rows[0],
      todasLasSucursales: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const ActualizarSucursal = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  const { username, sector } = req;

  try {
    const result = await pool.query(
      "UPDATE sucursal SET nombre = $1, WHERE id = $2 AND usuario = $3 RETURNING *",
      [nombre, id, username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "No se encontró ningún contrato con ese ID para el usuario actual",
      });
    }

    const selectResult = await pool.query("SELECT * FROM sucursal");

    res.status(201).json({
      todasLasSucursales: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al actualizar contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un contrato
export const EliminarSucursal = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM sucursal WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún contrato con ese ID" });
    }

    const selectResult = await pool.query("SELECT * FROM sucursal");

    res.status(201).json({
      todasLasSucursales: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al eliminar contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
