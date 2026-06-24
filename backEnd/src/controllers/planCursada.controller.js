const db = require("../db/models");

const {
    estudiante,
    situacion_academica,
    plan_cursada,
    plan_cursada_item,
    materia,
    sequelize,
} = db;

const buildError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getEstudiante = async (usuarioId) =>
    estudiante.findOne({ where: { usuario_id: usuarioId } });

const getSituacionActiva = async (estudianteId) =>
    situacion_academica.findOne({
        where: { estudiante_id: estudianteId },
        order: [["fecha_inicio", "DESC"], ["createdAt", "DESC"], ["id", "DESC"]],
    });

const formatPlan = (plan) => {
    const plain = plan.get ? plan.get({ plain: true }) : plan;

    return {
        id: plain.id,
        nombre: plain.nombre,
        situacion_id: plain.situacion_id,
        activo: plain.activo,
        created_at: plain.created_at,
        plan_cursada_items: (plain.plan_cursada_items || []).map((item) => ({
            id: item.id,
            plan_id: item.plan_id,
            materia_id: item.materia_id,
            anio_proyectado: item.anio_proyectado,
            cuatrimestre_proyectado: item.cuatrimestre_proyectado,
            horas: item.horas,
            horas_extra: item.horas_extra,
            materia: item.materia
                ? {
                    id: item.materia.id,
                    nombre: item.materia.nombre,
                    carga_horaria_semanal: item.materia.carga_horaria_semanal,
                }
                : null,
        })),
    };
};

const guardarPlanCursada = async (req, res, next) => {
    try {
        const { nombre, items = [] } = req.body;

        if (!nombre || !nombre.trim()) {
            return next(buildError("El nombre del plan es obligatorio", 400));
        }

        if (!Array.isArray(items) || items.length === 0) {
            return next(buildError("El plan debe tener al menos una materia", 400));
        }

        const estudianteData = await getEstudiante(req.user.sub);
        if (!estudianteData) {
            return next(buildError("Estudiante no encontrado", 404));
        }

        const situacion = await getSituacionActiva(estudianteData.id);
        if (!situacion) {
            return next(buildError("Situación académica no encontrada", 404));
        }

        const materiaIds = items.map((item) => Number(item.materia_id));

        if (materiaIds.some((id) => !Number.isInteger(id) || id <= 0)) {
            return next(buildError("El plan contiene materias inválidas", 400));
        }

        const materiasDelPlan = await materia.findAll({
            where: {
                id: materiaIds,
                plan_id: situacion.plan_id,
            },
            attributes: ["id"],
            raw: true,
        });

        const materiasValidas = new Set(materiasDelPlan.map((m) => m.id));

        const hayMateriaFueraDelPlan = materiaIds.some(
            (id) => !materiasValidas.has(id)
        );

        if (hayMateriaFueraDelPlan) {
            return next(
                buildError("El plan contiene materias que no pertenecen a tu plan de estudios", 400)
            );
        }

        const nuevoPlan = await sequelize.transaction(async (t) => {
            const plan = await plan_cursada.create(
                {
                    situacion_id: situacion.id,
                    nombre: nombre.trim(),
                    activo: true,
                    created_at: new Date(),
                },
                { transaction: t }
            );

            const itemsToCreate = items.map((item) => ({
                plan_id: plan.id,
                materia_id: Number(item.materia_id),
                anio_proyectado: Number(item.anio_proyectado) || 1,
                cuatrimestre_proyectado: Number(item.cuatrimestre_proyectado) || 1,
                horas: Number(item.horas) || 0,
                horas_extra: Number(item.horas_extra) || 0,
            }));

            await plan_cursada_item.bulkCreate(itemsToCreate, { transaction: t });

            return plan;
        });

        const planCompleto = await plan_cursada.findByPk(nuevoPlan.id, {
            include: [
                {
                    model: plan_cursada_item,
                    as: "plan_cursada_items",
                    include: [
                        {
                            model: materia,
                            as: "materia",
                            attributes: ["id", "nombre", "carga_horaria_semanal"],
                        },
                    ],
                },
            ],
        });

        return res.status(201).json({
            ok: true,
            data: formatPlan(planCompleto),
        });
    } catch (err) {
        next(err);
    }
};

const obtenerPlanesCursada = async (req, res, next) => {
    try {
        const estudianteData = await getEstudiante(req.user.sub);
        if (!estudianteData) {
            return next(buildError("Estudiante no encontrado", 404));
        }

        const situacion = await getSituacionActiva(estudianteData.id);
        if (!situacion) {
            return res.status(200).json({ ok: true, data: [] });
        }

        const planes = await plan_cursada.findAll({
            where: { situacion_id: situacion.id },
            include: [
                {
                    model: plan_cursada_item,
                    as: "plan_cursada_items",
                    include: [
                        {
                            model: materia,
                            as: "materia",
                            attributes: ["id", "nombre", "carga_horaria_semanal"],
                        },
                    ],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        return res.status(200).json({
            ok: true,
            data: planes.map(formatPlan),
        });
    } catch (err) {
        next(err);
    }
};

const obtenerPlanCursada = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return next(buildError("id de plan inválido", 400));
        }

        const estudianteData = await getEstudiante(req.user.sub);
        if (!estudianteData) {
            return next(buildError("Estudiante no encontrado", 404));
        }

        const situacion = await getSituacionActiva(estudianteData.id);
        if (!situacion) {
            return next(buildError("Situación académica no encontrada", 404));
        }

        const plan = await plan_cursada.findOne({
            where: {
                id,
                situacion_id: situacion.id,
            },
            include: [
                {
                    model: plan_cursada_item,
                    as: "plan_cursada_items",
                    include: [
                        {
                            model: materia,
                            as: "materia",
                            attributes: ["id", "nombre", "carga_horaria_semanal"],
                        },
                    ],
                },
            ],
        });

        if (!plan) {
            return next(buildError("Plan de cursada no encontrado", 404));
        }

        return res.status(200).json({
            ok: true,
            data: formatPlan(plan),
        });
    } catch (err) {
        next(err);
    }
};

const eliminarPlanCursada = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return next(buildError("id de plan inválido", 400));
        }

        const estudianteData = await getEstudiante(req.user.sub);
        if (!estudianteData) {
            return next(buildError("Estudiante no encontrado", 404));
        }

        const situacion = await getSituacionActiva(estudianteData.id);
        if (!situacion) {
            return next(buildError("Situación académica no encontrada", 404));
        }

        const plan = await plan_cursada.findOne({
            where: {
                id,
                situacion_id: situacion.id,
            },
        });

        if (!plan) {
            return next(buildError("Plan de cursada no encontrado", 404));
        }

        await sequelize.transaction(async (t) => {
            await plan_cursada_item.destroy({
                where: { plan_id: id },
                transaction: t,
            });

            await plan.destroy({ transaction: t });
        });

        return res.status(200).json({
            ok: true,
            data: { id },
            message: "Plan eliminado correctamente",
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    guardarPlanCursada,
    obtenerPlanesCursada,
    obtenerPlanCursada,
    eliminarPlanCursada,
};