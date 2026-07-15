'use strict';

const hasConstraint = async (queryInterface, tableName, constraintName) => {
  const constraints = await queryInterface.showConstraint(tableName);
  return constraints.some((constraint) => constraint.constraintName === constraintName);
};

const addConstraintIfMissing = async (
  queryInterface,
  tableName,
  constraintName,
  options
) => {
  if (options.type === 'unique') {
    const indexes = await queryInterface.showIndex(tableName);
    if (indexes.some((index) => index.name === constraintName)) return;
  }

  if (!(await hasConstraint(queryInterface, tableName, constraintName))) {
    await queryInterface.addConstraint(tableName, {
      ...options,
      name: constraintName,
    });
  }
};

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
  const columns = await queryInterface.describeTable(tableName);
  if (!columns[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

const sanearDatosAcademicos = async (queryInterface) => {
  const db = queryInterface.sequelize;

  await db.query(`
    DELETE FROM finals f
    WHERE f.estado_materia_id IS NULL
       OR NOT EXISTS (SELECT 1 FROM estado_materia em WHERE em.id = f.estado_materia_id)
  `);
  await db.query(`
    DELETE FROM finals f
    WHERE EXISTS (
      SELECT 1
      FROM estado_materia em
      LEFT JOIN situacion_academicas sa ON sa.id = em.situacion_id
      LEFT JOIN materia m ON m.id = em.materia_id
      WHERE em.id = f.estado_materia_id
        AND (
          em.situacion_id IS NULL OR em.materia_id IS NULL
          OR sa.id IS NULL OR m.id IS NULL
          OR sa.plan_id IS NULL OR m.plan_id IS NULL
          OR sa.plan_id <> m.plan_id
        )
    )
  `);
  await db.query(`
    DELETE FROM estado_materia em
    WHERE em.situacion_id IS NULL OR em.materia_id IS NULL
       OR NOT EXISTS (
         SELECT 1
         FROM situacion_academicas sa
         JOIN materia m ON m.id = em.materia_id
         WHERE sa.id = em.situacion_id
           AND sa.plan_id = m.plan_id
       )
  `);
  await db.query(`
    DELETE FROM finals f
    WHERE f.estado_materia_id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY situacion_id, materia_id ORDER BY id DESC
        ) AS row_number
        FROM estado_materia
      ) ranked
      WHERE ranked.row_number > 1
    )
  `);
  await db.query(`
    DELETE FROM estado_materia
    WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY situacion_id, materia_id ORDER BY id DESC
        ) AS row_number
        FROM estado_materia
      ) ranked
      WHERE ranked.row_number > 1
    )
  `);
  await db.query(`
    UPDATE estado_materia SET estado = 'aprobada'
    WHERE LOWER(TRIM(COALESCE(estado, ''))) IN (
      'aprobada', 'aprobado', 'promocionada', 'promotionada'
    )
  `);
  await db.query(`
    UPDATE estado_materia SET estado = 'regular'
    WHERE LOWER(TRIM(COALESCE(estado, ''))) IN (
      'regular', 'regularizada', 'regularizado'
    )
  `);
  await db.query(`
    UPDATE estado_materia SET estado = 'cursando'
    WHERE LOWER(TRIM(COALESCE(estado, ''))) = 'cursando'
  `);
  await db.query(`
    DELETE FROM finals f
    WHERE f.estado_materia_id IN (
      SELECT id FROM estado_materia
      WHERE LOWER(TRIM(COALESCE(estado, ''))) NOT IN (
        'pendiente', 'cursando', 'regular', 'aprobada'
      )
    )
  `);
  await db.query(`
    UPDATE estado_materia
    SET estado = 'pendiente', anio = NULL, cuatrimestre = NULL, nota = NULL, fecha = NULL
    WHERE LOWER(TRIM(COALESCE(estado, ''))) NOT IN (
      'pendiente', 'cursando', 'regular', 'aprobada'
    )
  `);
  await db.query(`
    DELETE FROM correlatividads c
    WHERE c.materia_id IS NULL OR c.materia_requisito_id IS NULL
       OR c.materia_id = c.materia_requisito_id
       OR c.tipo IS NULL OR c.tipo NOT IN ('cursar', 'aprobar')
       OR NOT EXISTS (
         SELECT 1
         FROM materia destino
         JOIN materia requisito ON requisito.id = c.materia_requisito_id
         WHERE destino.id = c.materia_id
           AND destino.plan_id = requisito.plan_id
       )
  `);
  await db.query(`
    DELETE FROM correlatividads
    WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY materia_id, materia_requisito_id ORDER BY id DESC
        ) AS row_number
        FROM correlatividads
      ) ranked
      WHERE ranked.row_number > 1
    )
  `);

  await db.query(`
    DELETE FROM finals f
    USING estado_materia em
    WHERE em.id = f.estado_materia_id
      AND f.aprobado = TRUE
      AND em.estado <> 'aprobada'
  `);

  const [materias] = await db.query(`SELECT id, plan_id FROM materia`);
  const [relaciones] = await db.query(`
    SELECT materia_id, materia_requisito_id, tipo FROM correlatividads
  `);
  const [situaciones] = await db.query(`SELECT id, plan_id FROM situacion_academicas`);
  const [estados] = await db.query(`
    SELECT id, situacion_id, materia_id, estado FROM estado_materia
  `);
  const relacionesPorMateria = new Map();

  for (const relacion of relaciones) {
    const materiaId = Number(relacion.materia_id);
    const current = relacionesPorMateria.get(materiaId) || [];
    current.push({
      requisitoId: Number(relacion.materia_requisito_id),
      tipo: relacion.tipo,
    });
    relacionesPorMateria.set(materiaId, current);
  }

  const materiasPorPlan = new Map();
  for (const materia of materias) {
    const planId = Number(materia.plan_id);
    const ids = materiasPorPlan.get(planId) || [];
    ids.push(Number(materia.id));
    materiasPorPlan.set(planId, ids);
  }
  for (const ids of materiasPorPlan.values()) {
    const estadoVisita = new Map();
    const visitar = (materiaId) => {
      if (estadoVisita.get(materiaId) === 1) {
        throw new Error(`El plan contiene un ciclo de correlativas en la materia ${materiaId}`);
      }
      if (estadoVisita.get(materiaId) === 2) return;
      estadoVisita.set(materiaId, 1);
      for (const relacion of relacionesPorMateria.get(materiaId) || []) {
        visitar(relacion.requisitoId);
      }
      estadoVisita.set(materiaId, 2);
    };
    ids.forEach(visitar);
  }

  const estadosPorSituacion = new Map();
  for (const estado of estados) {
    const situacionId = Number(estado.situacion_id);
    const current = estadosPorSituacion.get(situacionId) || new Map();
    current.set(Number(estado.materia_id), {
      id: Number(estado.id),
      estado: estado.estado,
    });
    estadosPorSituacion.set(situacionId, current);
  }

  for (const situacion of situaciones) {
    const estadosSituacion = estadosPorSituacion.get(Number(situacion.id)) || new Map();
    while (true) {
      const invalidStateIds = [];
      for (const [materiaId, estado] of estadosSituacion.entries()) {
        if (estado.estado === 'pendiente') continue;
        const incumple = (relacionesPorMateria.get(materiaId) || []).some((relacion) => {
          const estadoRequisito = estadosSituacion.get(relacion.requisitoId)?.estado || 'pendiente';
          return relacion.tipo === 'cursar'
            ? !['regular', 'aprobada'].includes(estadoRequisito)
            : estadoRequisito !== 'aprobada';
        });
        if (incumple) invalidStateIds.push(estado.id);
      }
      if (invalidStateIds.length === 0) break;

      await db.query(`
        DELETE FROM finals WHERE estado_materia_id IN (:stateIds)
      `, { replacements: { stateIds: invalidStateIds } });
      await db.query(`
        UPDATE estado_materia
        SET estado = 'pendiente', anio = NULL, cuatrimestre = NULL, nota = NULL, fecha = NULL
        WHERE id IN (:stateIds)
      `, { replacements: { stateIds: invalidStateIds } });
      for (const estado of estadosSituacion.values()) {
        if (invalidStateIds.includes(estado.id)) estado.estado = 'pendiente';
      }
    }
  }
};

module.exports = {
  async up(baseQueryInterface, Sequelize) {
    return baseQueryInterface.sequelize.transaction(async (transaction) => {
    const queryInterface = {
      sequelize: {
        query: (sql, options = {}) =>
          baseQueryInterface.sequelize.query(sql, { ...options, transaction }),
      },
      showConstraint: (tableName, constraintName, options = {}) =>
        baseQueryInterface.showConstraint(tableName, constraintName, {
          ...options,
          transaction,
        }),
      showIndex: (tableName, options = {}) =>
        baseQueryInterface.showIndex(tableName, { ...options, transaction }),
      addConstraint: (tableName, options) =>
        baseQueryInterface.addConstraint(tableName, { ...options, transaction }),
      describeTable: (tableName) =>
        baseQueryInterface.describeTable(tableName, { transaction }),
      addColumn: (tableName, columnName, definition) =>
        baseQueryInterface.addColumn(tableName, columnName, definition, { transaction }),
      showAllTables: () => baseQueryInterface.showAllTables({ transaction }),
      renameTable: (before, after) =>
        baseQueryInterface.renameTable(before, after, { transaction }),
      changeColumn: (tableName, columnName, definition) =>
        baseQueryInterface.changeColumn(tableName, columnName, definition, { transaction }),
    };
    const tableEntries = await queryInterface.showAllTables();
    const tableNames = new Set(
      tableEntries.map((table) =>
        typeof table === 'string' ? table : table.tableName || table.table_name
      )
    );

    if (!tableNames.has('materia') && tableNames.has('materias')) {
      await queryInterface.renameTable('materias', 'materia');
      tableNames.delete('materias');
      tableNames.add('materia');
    }
    if (!tableNames.has('estado_materia') && tableNames.has('estado_materias')) {
      await queryInterface.renameTable('estado_materias', 'estado_materia');
      tableNames.delete('estado_materias');
      tableNames.add('estado_materia');
    }

    await addColumnIfMissing(queryInterface, 'materia', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'materia', 'codigo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'materia', 'modalidad', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'plan_estudios', 'carrera_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'plan_estudios', 'anio', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'situacion_academicas', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'situacion_academicas', 'estudiante_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'finals', 'estado_materia_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    const estadoColumns = await queryInterface.describeTable('estado_materia');
    if (!estadoColumns.situacion_id) {
      await queryInterface.addColumn('estado_materia', 'situacion_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!estadoColumns.materia_id) {
      await queryInterface.addColumn('estado_materia', 'materia_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    const correlatividadColumns = await queryInterface.describeTable('correlatividads');
    if (!correlatividadColumns.materia_id) {
      await queryInterface.addColumn('correlatividads', 'materia_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!correlatividadColumns.materia_requisito_id) {
      await queryInterface.addColumn('correlatividads', 'materia_requisito_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    await sanearDatosAcademicos(queryInterface);

    await queryInterface.changeColumn('estado_materia', 'situacion_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('estado_materia', 'materia_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('estado_materia', 'estado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pendiente',
    });
    await queryInterface.changeColumn('correlatividads', 'materia_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('correlatividads', 'materia_requisito_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('correlatividads', 'tipo', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('finals', 'estado_materia_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await addConstraintIfMissing(
      queryInterface,
      'estado_materia',
      'estado_materias_situacion_fk',
      {
        fields: ['situacion_id'],
        type: 'foreign key',
        references: { table: 'situacion_academicas', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    );
    await addConstraintIfMissing(
      queryInterface,
      'estado_materia',
      'estado_materias_materia_fk',
      {
        fields: ['materia_id'],
        type: 'foreign key',
        references: { table: 'materia', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    );
    await addConstraintIfMissing(
      queryInterface,
      'correlatividads',
      'correlatividads_materia_fk',
      {
        fields: ['materia_id'],
        type: 'foreign key',
        references: { table: 'materia', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    );
    await addConstraintIfMissing(
      queryInterface,
      'finals',
      'finals_estado_materia_fk',
      {
        fields: ['estado_materia_id'],
        type: 'foreign key',
        references: { table: 'estado_materia', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    );
    await addConstraintIfMissing(
      queryInterface,
      'correlatividads',
      'correlatividads_requisito_fk',
      {
        fields: ['materia_requisito_id'],
        type: 'foreign key',
        references: { table: 'materia', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    );

    await addConstraintIfMissing(
      queryInterface,
      'estado_materia',
      'estado_materias_situacion_materia_unique',
      { fields: ['situacion_id', 'materia_id'], type: 'unique' }
    );
    await addConstraintIfMissing(
      queryInterface,
      'correlatividads',
      'correlatividads_materia_requisito_unique',
      { fields: ['materia_id', 'materia_requisito_id'], type: 'unique' }
    );
    await addConstraintIfMissing(
      queryInterface,
      'estado_materia',
      'estado_materias_estado_valido',
      {
        fields: ['estado'],
        type: 'check',
        where: {
          estado: { [Sequelize.Op.in]: ['pendiente', 'cursando', 'regular', 'aprobada'] },
        },
      }
    );
    await addConstraintIfMissing(
      queryInterface,
      'correlatividads',
      'correlatividads_tipo_valido',
      {
        fields: ['tipo'],
        type: 'check',
        where: { tipo: { [Sequelize.Op.in]: ['cursar', 'aprobar'] } },
      }
    );
    await addConstraintIfMissing(
      queryInterface,
      'correlatividads',
      'correlatividads_sin_autorreferencia',
      {
        fields: ['materia_id', 'materia_requisito_id'],
        type: 'check',
        where: Sequelize.where(
          Sequelize.col('materia_id'),
          Sequelize.Op.ne,
          Sequelize.col('materia_requisito_id')
        ),
      }
    );
    });
  },

  async down(queryInterface) {
    const constraints = [
      ['correlatividads', 'correlatividads_sin_autorreferencia'],
      ['correlatividads', 'correlatividads_tipo_valido'],
      ['estado_materia', 'estado_materias_estado_valido'],
      ['correlatividads', 'correlatividads_materia_requisito_unique'],
      ['estado_materia', 'estado_materias_situacion_materia_unique'],
      ['finals', 'finals_estado_materia_fk'],
      ['correlatividads', 'correlatividads_requisito_fk'],
      ['correlatividads', 'correlatividads_materia_fk'],
      ['estado_materia', 'estado_materias_materia_fk'],
      ['estado_materia', 'estado_materias_situacion_fk'],
    ];

    for (const [tableName, constraintName] of constraints) {
      if (await hasConstraint(queryInterface, tableName, constraintName)) {
        await queryInterface.removeConstraint(tableName, constraintName);
      }
    }
  },
};
