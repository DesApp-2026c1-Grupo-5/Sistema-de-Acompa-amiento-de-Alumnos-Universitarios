const { Op } = require("sequelize");
const db = require("../db/models");

const {
  denuncia,
  motivo_denuncia,
  material,
  estudiante,
  administrador,
  usuario,
  sequelize,
} = db;

const { crearNotificacion } = require("../services/notificacion.service");
const { sendMail } = require("../services/mailer.service");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const computeSeveridad = (cantidad) => {
  if (cantidad >= 8) return "alta";
  if (cantidad >= 4) return "media";
  return "baja";
};

const computeEstadoResumen = (suspendido, denuncias) => {
  if (suspendido) return "suspendido";

  const pendientes = denuncias.filter((d) => d.estado === "pendiente").length;
  if (pendientes > 0) return "pendiente";

  return "rechazada";
};

const getAdminId = async (req) => {
  const admin = await administrador.findOne({
    where: { usuario_id: req.user.sub },
  });
  return admin?.id ?? null;
};

const validarMaterialId = (raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
};

const listarStats = async (req, res) => {
  const [pendientes, verificadas, materiales_suspendidos] = await Promise.all([
    denuncia.count({ where: { estado: "pendiente" } }),
    denuncia.count({ where: { estado: "verificada" } }),
    material.count({ where: { suspendido: true } }),
  ]);

  return res.status(200).json({
    ok: true,
    data: { pendientes, verificadas, materiales_suspendidos },
  });
};

const listarDenuncias = async (req, res) => {
  const { q, estado, page, limit } = req.query;

  const idsRows = await denuncia.findAll({
    attributes: ["material_id"],
    group: ["material_id"],
    raw: true,
  });
  const materialIds = idsRows.map((r) => r.material_id);

  if (materialIds.length === 0) {
    return res.status(200).json({
      ok: true,
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }

  const where = { id: { [Op.in]: materialIds } };

  if (estado === "suspendido") {
    where.suspendido = true;
  }

  const materiales = await material.findAll({
    where,
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido"] },
      { model: denuncia, as: "denuncias", attributes: ["id", "estado"] },
    ],
    order: [["id", "DESC"]],
  });

  let items = materiales.map((m) => {
    const plain = m.get({ plain: true });
    const denuncias = plain.denuncias || [];
    const cantidad = denuncias.length;

    return {
      material: {
        id: plain.id,
        titulo: plain.titulo,
        tipo: plain.tipo,
        suspendido: plain.suspendido,
      },
      uploader: plain.estudiante
        ? {
          id: plain.estudiante.id,
          nombre: plain.estudiante.nombre,
          apellido: plain.estudiante.apellido,
        }
        : null,
      cantidad_denuncias: cantidad,
      severidad: computeSeveridad(cantidad),
      estado_resumen: computeEstadoResumen(plain.suspendido, denuncias),
    };
  });

  if (q) {
    const lower = q.toLowerCase();
    items = items.filter((it) => {
      const tituloMatch = it.material.titulo?.toLowerCase().includes(lower);
      const uploaderNombre = it.uploader
        ? `${it.uploader.nombre} ${it.uploader.apellido}`.toLowerCase()
        : "";
      return tituloMatch || uploaderNombre.includes(lower);
    });
  }

  if (estado && estado !== "todos" && estado !== "suspendido") {
    items = items.filter((it) => it.estado_resumen === estado);
  }

  const total = items.length;
  const offset = (page - 1) * limit;
  const data = items.slice(offset, offset + limit);

  return res.status(200).json({
    ok: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

const obtenerDetalle = async (req, res, next) => {
  const materialId = validarMaterialId(req.params.materialId);
  if (!materialId) {
    return next(buildError("id de material invalido", 400));
  }

  const mat = await material.findByPk(materialId, {
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido"] },
      {
        model: denuncia,
        as: "denuncias",
        include: [
          {
            model: motivo_denuncia,
            as: "motivo",
            attributes: ["id", "descripcion"],
          },
          {
            model: estudiante,
            as: "denunciante",
            attributes: ["id", "nombre", "apellido"],
          },
        ],
      },
    ],
  });

  if (!mat) {
    return next(buildError("Material no encontrado", 404));
  }

  const plain = mat.get({ plain: true });
  const denuncias = plain.denuncias || [];

  return res.status(200).json({
    ok: true,
    data: {
      material: {
        id: plain.id,
        titulo: plain.titulo,
        tipo: plain.tipo,
        suspendido: plain.suspendido,
      },
      uploader: plain.estudiante
        ? {
          id: plain.estudiante.id,
          nombre: plain.estudiante.nombre,
          apellido: plain.estudiante.apellido,
        }
        : null,
      cantidad_denuncias: denuncias.length,
      estado_resumen: computeEstadoResumen(plain.suspendido, denuncias),
      denuncias: denuncias.map((d) => ({
        id: d.id,
        motivo: d.motivo
          ? { id: d.motivo.id, nombre: d.motivo.descripcion }
          : null,
        detalle: d.detalle,
        estado: d.estado,
        fecha_creacion: d.fecha_creacion,
        fecha_resolucion: d.fecha_resolucion,
        denunciante: d.denunciante
          ? {
            id: d.denunciante.id,
            nombre: d.denunciante.nombre,
            apellido: d.denunciante.apellido,
          }
          : null,
      })),
    },
  });
};

const resolverDenunciasPendientes = async (materialId, nuevoEstado, adminId) => {
  return sequelize.transaction(async (t) => {
    const [count] = await denuncia.update(
      {
        estado: nuevoEstado,
        fecha_resolucion: new Date(),
        admin_revisor_id: adminId,
      },
      {
        where: { material_id: materialId, estado: "pendiente" },
        transaction: t,
      }
    );
    return count;
  });
};

const notificarDenunciantes = async (pendientes, materialTitulo, nuevoEstado, emisor_usuario_id) => {
  for (const d of pendientes) {
    const denuncianteRaw = d.denunciante;
    if (!denuncianteRaw) continue;

    const esVerificada = nuevoEstado === "verificada";
    const texto = esVerificada ? "verificada" : "rechazada";

    await crearNotificacion({
      usuario_id: denuncianteRaw.usuario_id,
      emisor_usuario_id,
      titulo: `Denuncia ${texto}`,
      tipo: "general",
      mensaje: `Tu denuncia sobre "${materialTitulo}" fue ${texto}.`,
      referencia_tipo: "denuncia",
      referencia_id: d.id,
      action_url: "/student/materials",
    });

    const userEmail = denuncianteRaw.usuario?.email;
    if (userEmail) {
      await sendMail({
        to: userEmail,
        subject: `Denuncia ${texto}`,
        html: `       <p>Tu denuncia sobre <strong>"${materialTitulo}"</strong> fue <strong>${texto}</strong>.</p>
               <p>Saludos,<br/>El equipo de SIVA</p>`,
      });
    }
  }
};

const cambiarEstadoDenuncias = (nuevoEstado) => async (req, res, next) => {
  const materialId = validarMaterialId(req.params.id);
  if (!materialId) {
    return next(buildError("id de material invalido", 400));
  }

  const mat = await material.findByPk(materialId);
  if (!mat) {
    return next(buildError("Material no encontrado", 404));
  }

  const pendientes = await denuncia.findAll({
    where: { material_id: materialId, estado: "pendiente" },
    include: [
      {
        model: estudiante,
        as: "denunciante",
        include: [{ model: usuario, attributes: ["email"] }],
      },
    ],
  });

  if (pendientes.length === 0) {
    return next(buildError("No hay denuncias pendientes para procesar", 400));
  }

  const adminId = await getAdminId(req);
  if (!adminId) {
    return next(buildError("Administrador no encontrado", 404));
  }

  const actualizadas = await resolverDenunciasPendientes(
    materialId,
    nuevoEstado,
    adminId
  );

  notificarDenunciantes(pendientes, mat.titulo, nuevoEstado, req.user.sub);

  return res.status(200).json({
    ok: true,
    data: {
      material_id: materialId,
      nuevo_estado: nuevoEstado,
      denuncias_actualizadas: actualizadas,
    },
  });
};

const verificarDenuncias = cambiarEstadoDenuncias("verificada");
const rechazarDenuncias = cambiarEstadoDenuncias("rechazada");

const suspenderMaterial = async (req, res, next) => {
  const materialId = validarMaterialId(req.params.id);
  if (!materialId) {
    return next(buildError("id de material invalido", 400));
  }

  const mat = await material.findByPk(materialId, {
    include: [
      {
        model: estudiante,
        include: [{ model: usuario, attributes: ["email"] }],
      },
    ],
  });
  if (!mat) {
    return next(buildError("Material no encontrado", 404));
  }
  if (mat.suspendido) {
    return next(buildError("El material ya esta suspendido", 400));
  }

  const pendientes = await denuncia.findAll({
    where: { material_id: materialId, estado: "pendiente" },
    include: [
      {
        model: estudiante,
        as: "denunciante",
        include: [{ model: usuario, attributes: ["email"] }],
      },
    ],
  });

  const adminId = await getAdminId(req);
  if (!adminId) {
    return next(buildError("Administrador no encontrado", 404));
  }

  const actualizadas = await sequelize.transaction(async (t) => {
    await mat.update({ suspendido: true }, { transaction: t });
    const [count] = await denuncia.update(
      {
        estado: "verificada",
        fecha_resolucion: new Date(),
        admin_revisor_id: adminId,
      },
      {
        where: { material_id: materialId, estado: "pendiente" },
        transaction: t,
      }
    );
    return count;
  });

  const uploaderEmail = mat.estudiante?.usuario?.email;

  await crearNotificacion({
    usuario_id: mat.estudiante?.usuario_id,
    emisor_usuario_id: req.user.sub,
    titulo: "Material suspendido",
    tipo: "general",
    mensaje: `Tu material "${mat.titulo}" fue suspendido debido a denuncias verificadas.`,
    referencia_tipo: "denuncia",
    referencia_id: materialId,
    action_url: "/student/materials",
  });

  if (uploaderEmail) {
    await sendMail({
      to: uploaderEmail,
      subject: "Material suspendido",
      html: `<p>Tu material <strong>"${mat.titulo}"</strong> fue suspendido debido a denuncias verificadas.</p>
             <p>Si consideras que es un error, contacta con el administrador.</p>
             <p>Saludos,<br/>El equipo de SIVA</p>`,
    });
  }

  notificarDenunciantes(pendientes, mat.titulo, "verificada", req.user.sub);

  return res.status(200).json({
    ok: true,
    data: {
      id: mat.id,
      suspendido: true,
      denuncias_actualizadas: actualizadas,
    },
  });
};

const restaurarMaterial = async (req, res, next) => {
  const materialId = validarMaterialId(req.params.id);
  if (!materialId) {
    return next(buildError("id de material invalido", 400));
  }

  const mat = await material.findByPk(materialId, {
    include: [
      {
        model: estudiante,
        include: [{ model: usuario, attributes: ["email"] }],
      },
    ],
  });
  if (!mat) {
    return next(buildError("Material no encontrado", 404));
  }
  if (!mat.suspendido) {
    return next(buildError("El material no esta suspendido", 400));
  }

  await sequelize.transaction(async (t) => {
    await mat.update(
      { suspendido: false },
      { transaction: t }
    );

    await denuncia.update(
      {
        estado: "pendiente",
        fecha_resolucion: null,
        admin_revisor_id: null,
      },
      {
        where: { material_id: materialId },
        transaction: t,
      }
    );
  });

  const uploaderEmail = mat.estudiante?.usuario?.email;

  await crearNotificacion({
    usuario_id: mat.estudiante?.usuario_id,
    emisor_usuario_id: req.user.sub,
    titulo: "Material restaurado",
    tipo: "general",
    mensaje: `Tu material "${mat.titulo}" fue restaurado y ya está visible nuevamente.`,
    referencia_tipo: "denuncia",
    referencia_id: materialId,
    action_url: "/student/materials",
  });

  if (uploaderEmail) {
    await sendMail({
      to: uploaderEmail,
      subject: "Material restaurado",
      html: `<p>Tu material <strong>"${mat.titulo}"</strong> fue restaurado y ya está visible nuevamente.</p>
             <p>Saludos,<br/>El equipo de SIVA</p>`,
    });
  }

  return res.status(200).json({
    ok: true,
    data: { id: mat.id, suspendido: false },
  });
};

module.exports = {
  listarStats,
  listarDenuncias,
  obtenerDetalle,
  verificarDenuncias,
  rechazarDenuncias,
  suspenderMaterial,
  restaurarMaterial,
};
