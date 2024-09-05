import { pool } from "../db.js";

// Obtener todas las garitas
export const getGaritas = async (req, res, next) => {
  const { username } = req;

  // Check if username is properly passed
  if (!username) {
    return res
      .status(400)
      .json({ error: "No se proporcionó un nombre de usuario válido." });
  }

  try {
    // Log the username to verify that it is correctly extracted
    console.log("Username:", username);

    // Perform the query
    const result = await pool.query(
      "SELECT * FROM garitas WHERE usuario = $1",
      [username]
    );

    // Check if no rows were found
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron garitas" });
    }

    // Return the rows if successful
    return res.status(200).json(result.rows);
  } catch (error) {
    // Log the full error for debugging
    console.error("Error al obtener garitas:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener una garita por su ID
export const getGaritaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM garitas WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ninguna garita con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener garita por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearGarita = async (req, res) => {
  const {
    autorizo,
    destino,
    numero_remito,
    vigilador,
    chofer,
    dominio_chasis,
    dominio_acoplado,
  } = req.body;

  const { username, userRole, localidad, provincia, sector } = req;

  try {
    // Insert the new garita into the database
    const insertResult = await pool.query(
      "INSERT INTO garitas (autorizo, destino, numero_remito, vigilador, chofer, dominio_chasis, dominio_acoplado, localidad, usuario, role_id, sector, provincia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [
        autorizo,
        destino,
        numero_remito,
        vigilador,
        chofer,
        dominio_chasis,
        dominio_acoplado,
        localidad,
        username,
        userRole,
        sector,
        provincia,
      ]
    );

    // Fetch all garitas for the specified sector and user
    const selectResult = await pool.query(
      "SELECT * FROM garitas WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    // Respond with the newly created garita and all garitas
    res.status(201).json({
      nuevaGarita: insertResult.rows[0],
      todasLasGaritas: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear garita:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarGarita = async (req, res) => {
  const { id } = req.params;
  const {
    autorizo,
    destino,
    numero_remito,
    vigilador,
    chofer,
    dominio_chasis,
    dominio_acoplado,
  } = req.body;
  const { username, sector } = req;

  try {
    const result = await pool.query(
      "UPDATE garitas SET autorizo = $1, destino = $2, numero_remito = $3, vigilador = $4, chofer = $5, dominio_chasis = $6, dominio_acoplado = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND usuario = $9 RETURNING *",
      [
        autorizo,
        destino,
        numero_remito,
        vigilador,
        chofer,
        dominio_chasis,
        dominio_acoplado,
        id,
        username,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "No se encontró ninguna garita con ese ID para el usuario actual",
      });
    }

    const todasLasGaritas = await pool.query(
      "SELECT * FROM garitas WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      garitaActualizada: result.rows[0],
      todasLasGaritas: todasLasGaritas.rows,
    });
  } catch (error) {
    console.error("Error al actualizar garita:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar una garita
export const eliminarGarita = async (req, res) => {
  const { id } = req.params;
  const { username, sector } = req;

  try {
    const result = await pool.query("DELETE FROM garitas WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ninguna garita con ese ID" });
    }

    const todasLasGaritas = await pool.query(
      "SELECT * FROM garitas WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      garitaEliminada: result.rows[0],
      todasLasGaritas: todasLasGaritas.rows,
    });
  } catch (error) {
    console.error("Error al eliminar garita:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
