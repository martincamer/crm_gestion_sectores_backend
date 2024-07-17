import { pool } from "../db.js";

// Obtener todos los contratos
export const getContratos = async (req, res, next) => {
  const { username } = req;
  console.log(username);
  try {
    const result = await pool.query(
      "SELECT * FROM contratos WHERE usuario = $1",
      [username]
    );

    // const todosLosContratos = await pool.query(
    //   "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
    //   [sector, username]
    // );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron contratos" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener contratos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un contrato por su ID
export const getContratoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM contratos WHERE id = $1", [
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

export const crearContrato = async (req, res, next) => {
  const {
    nombre_apellido,
    localidad_contrato,
    provincia_contrato,
    numero_contrato,
    tipo_plan,
    cuotas_anticipo,
    estado,
    datos,
    sucursal,
  } = req.body;

  const { username, userRole, localidad, provincia, sector } = req;

  try {
    // Establecer valor por defecto para datos si no se proporciona
    const datosDefault = datos || "[]";
    const estadoDefault = estado || "sin estado ahún";
    const cuotas_anticipoDefault = cuotas_anticipo || "financiado de contado";

    const insertResult = await pool.query(
      "INSERT INTO contratos (nombre_apellido, localidad_contrato, provincia_contrato, numero_contrato, tipo_plan, cuotas_anticipo, estado, datos,sucursal, localidad, usuario, role_id, sector, provincia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
      [
        nombre_apellido,
        localidad_contrato,
        provincia_contrato,
        numero_contrato,
        tipo_plan,
        cuotas_anticipoDefault,
        estadoDefault,
        datosDefault, // Usar el valor por defecto calculado
        sucursal,
        localidad,
        username,
        userRole,
        sector,
        provincia,
      ]
    );

    const selectResult = await pool.query(
      "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(201).json({
      nuevoContrato: insertResult.rows[0],
      todosLosContratos: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarContrato = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_apellido,
    localidad_contrato,
    provincia_contrato,
    numero_contrato,
    tipo_plan,
    cuotas_anticipo,
  } = req.body;
  const { username, userRole, sector } = req;

  try {
    const result = await pool.query(
      "UPDATE contratos SET nombre_apellido = $1, localidad_contrato = $2, provincia_contrato = $3, numero_contrato = $4, tipo_plan = $5, cuotas_anticipo = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND usuario = $8 RETURNING *",
      [
        nombre_apellido,
        localidad_contrato,
        provincia_contrato,
        numero_contrato,
        tipo_plan,
        cuotas_anticipo,
        id,
        username,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "No se encontró ningún contrato con ese ID para el usuario actual",
      });
    }

    const todosLosContratos = await pool.query(
      "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      contratoActualizado: result.rows[0],
      todosLosContratos: todosLosContratos.rows,
    });
  } catch (error) {
    console.error("Error al actualizar contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un contrato
export const eliminarContrato = async (req, res) => {
  const { id } = req.params;
  const { username, sector } = req;

  try {
    const result = await pool.query("DELETE FROM contratos WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún contrato con ese ID" });
    }

    const todosLosContratos = await pool.query(
      "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      contratoActualizado: result.rows[0],
      todosLosContratos: todosLosContratos.rows,
    });
  } catch (error) {
    console.error("Error al eliminar contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

//actualizar [] datos
export const actualizarDatosContrato = async (req, res, next) => {
  const { id } = req.params; // Suponiendo que recibimos el ID del contrato a actualizar
  const { datos } = req.body;
  const { sector, username } = req;

  try {
    // Validar que `datos` esté presente y sea un objeto válido
    if (!datos || typeof datos !== "object") {
      return res
        .status(400)
        .json({ error: "Los datos proporcionados no son válidos." });
    }

    const estado = "por garantizar";

    // Actualizar solo el campo `datos` del contrato específico
    const updateResult = await pool.query(
      "UPDATE contratos SET datos = $1 WHERE id = $2 RETURNING *",
      [JSON.stringify(datos), id]
    );

    const result = await pool.query(
      "UPDATE contratos SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );

    // Verificar si se encontró y actualizó el contrato
    if (updateResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "El contrato especificado no existe." });
    }

    const todosLosContratos = await pool.query(
      "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      contratoActualizado: updateResult.rows[0],
      todosLosContratos: todosLosContratos.rows,
    });
  } catch (error) {
    console.error("Error al actualizar datos del contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const actualizarDatosContratoConPlatea = async (req, res, next) => {
  const { id } = req.params; // Suponiendo que recibimos el ID del contrato a actualizar
  const { datos } = req.body;
  const { sector, username } = req;

  try {
    // Validar que `datos` esté presente y sea un objeto válido
    if (!datos || typeof datos !== "object") {
      return res
        .status(400)
        .json({ error: "Los datos proporcionados no son válidos." });
    }

    const estado = "en sección con platea";

    // Actualizar solo el campo `datos` del contrato específico
    const updateResult = await pool.query(
      "UPDATE contratos SET datos = $1 WHERE id = $2 RETURNING *",
      [JSON.stringify(datos), id]
    );

    const result = await pool.query(
      "UPDATE contratos SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );

    // Verificar si se encontró y actualizó el contrato
    if (updateResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "El contrato especificado no existe." });
    }

    const todosLosContratos = await pool.query(
      "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      contratoActualizado: updateResult.rows[0],
      todosLosContratos: todosLosContratos.rows,
    });
  } catch (error) {
    console.error("Error al actualizar datos del contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const actualizarDatosContratoSinPlatea = async (req, res, next) => {
  const { id } = req.params; // Suponiendo que recibimos el ID del contrato a actualizar
  const { datos } = req.body;
  const { sector, username } = req;

  try {
    // Validar que `datos` esté presente y sea un objeto válido
    if (!datos || typeof datos !== "object") {
      return res
        .status(400)
        .json({ error: "Los datos proporcionados no son válidos." });
    }

    const estado = "en sección sin platea";

    // Actualizar solo el campo `datos` del contrato específico
    const updateResult = await pool.query(
      "UPDATE contratos SET datos = $1 WHERE id = $2 RETURNING *",
      [JSON.stringify(datos), id]
    );

    const result = await pool.query(
      "UPDATE contratos SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );

    // Verificar si se encontró y actualizó el contrato
    if (updateResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "El contrato especificado no existe." });
    }

    const todosLosContratos = await pool.query(
      "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      contratoActualizado: updateResult.rows[0],
      todosLosContratos: todosLosContratos.rows,
    });
  } catch (error) {
    console.error("Error al actualizar datos del contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const actualizarDatosContratoInformes = async (req, res, next) => {
  const { id } = req.params; // Suponiendo que recibimos el ID del contrato a actualizar
  const { datos } = req.body;
  const { sector, username } = req;

  try {
    // Validar que `datos` esté presente y sea un objeto válido
    if (!datos || typeof datos !== "object") {
      return res
        .status(400)
        .json({ error: "Los datos proporcionados no son válidos." });
    }

    const estado = "enviado a informes, completo";

    // Actualizar solo el campo `datos` del contrato específico
    const updateResult = await pool.query(
      "UPDATE contratos SET datos = $1 WHERE id = $2 RETURNING *",
      [JSON.stringify(datos), id]
    );

    const result = await pool.query(
      "UPDATE contratos SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );

    // Verificar si se encontró y actualizó el contrato
    if (updateResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "El contrato especificado no existe." });
    }

    const todosLosContratos = await pool.query(
      "SELECT * FROM contratos WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      contratoActualizado: updateResult.rows[0],
      todosLosContratos: todosLosContratos.rows,
    });
  } catch (error) {
    console.error("Error al actualizar datos del contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};
