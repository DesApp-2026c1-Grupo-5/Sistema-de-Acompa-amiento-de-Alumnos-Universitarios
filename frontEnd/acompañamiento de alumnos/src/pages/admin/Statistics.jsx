import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  FileText,
  Calendar,
  Flag,
  Link,
  BarChart3,
  ThumbsUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { getAdminStats } from '../../services/statsService';

import styles from './Statistics.module.css';

const icons = {
  users: Users,
  file: FileText,
  calendar: Calendar,
  flag: Flag,
  link: Link,
  chart: BarChart3,
};

export default function Statistics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('uso');
  const [ratingOrder, setRatingOrder] = useState('default');

  useEffect(() => {
    let cancelled = false;

    const cargarEstadisticas = async () => {
      try {
        setError(null);

        const res = await getAdminStats(ratingOrder);

        if (cancelled) return;

        setData(res?.data ?? null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err.message ||
          'No se pudieron cargar las estadísticas'
        );
      }
    };

    cargarEstadisticas();

    return () => {
      cancelled = true;
    };
  }, [ratingOrder]);

  if (error) {
    return <p className={styles.loading}>{error}</p>;
  }

  if (!data) {
    return <p className={styles.loading}>Cargando estadísticas...</p>;
  }

  const currentData =
    activeTab === 'uso'
      ? data.usoSistema
      : data.reportesSociales;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Estadísticas y Reportes</h1>
        <p>Análisis del uso del sistema y comportamiento de usuarios</p>
      </header>

      <section className={styles.filtersCard}>
        <div className={styles.filterGroup}>
          <label>Período</label>

          <select>
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Último cuatrimestre</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Carrera</label>

          <select>
            <option>Todas las carreras</option>
            <option>Lic. en Sistemas</option>
            <option>Ing. en Sistemas</option>
            <option>Lic. en Informática</option>
            <option>Tecnicatura en Programación</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Plan de estudios</label>

          <select>
            <option>Todos los planes</option>
            <option>Plan 2023</option>
            <option>Plan 2020</option>
            <option>Plan 2017</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Año académico</label>

          <select>
            <option>Todos</option>
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>
      </section>

      <div className={styles.tabs}>
        <button
          className={
            activeTab === 'uso'
              ? styles.activeTab
              : ''
          }
          onClick={() => setActiveTab('uso')}
        >
          Reportes de Uso del Sistema
        </button>

        <button
          className={
            activeTab === 'social'
              ? styles.activeTab
              : ''
          }
          onClick={() => setActiveTab('social')}
        >
          Reportes Sociales
        </button>
      </div>

      <section className={styles.metricsGrid}>
        {currentData.metricas.map((metric) => {
          const Icon = icons[metric.icon];

          return (
            <article
              className={styles.metricCard}
              key={metric.id}
            >
              <div className={styles.metricTop}>
                <div
                  className={`${styles.metricIcon} ${styles[metric.icon]}`}
                >
                  <Icon size={21} />
                </div>

                {metric.trend && (
                  <span
                    className={`${styles.trend} ${
                      metric.trendType === 'negative'
                        ? styles.negative
                        : styles.positive
                    }`}
                  >
                    ↗ {metric.trend}
                  </span>
                )}
              </div>

              <strong>{metric.value}</strong>
              <p>{metric.label}</p>
            </article>
          );
        })}
      </section>

      {activeTab === 'uso' ? (
        <UsoSistema
          data={data.usoSistema}
          ratingOrder={ratingOrder}
          setRatingOrder={setRatingOrder}
        />
      ) : (
        <ReportesSociales
          data={data.reportesSociales}
        />
      )}
    </section>
  );
}

function UsoSistema({
  data,
  ratingOrder,
  setRatingOrder,
}) {
  const sesionesData = useMemo(
    () =>
      data.sesionesPeriodo.months.map(
        (month, index) => ({
          month,
          value:
            data.sesionesPeriodo.data?.[index] ??
            0,
        })
      ),
    [data.sesionesPeriodo]
  );

  return (
    <>
      <MonthlyLineChart
        title="Usuarios activos en el tiempo"
        data={data.usuariosActivosSerie || []}
      />

      <div className={styles.twoColumns}>
        <DistributionCard
          title="Materias cursadas por alumno"
          items={data.materiasCursadasAlumno}
          valueKey="students"
          valueLabel="estudiantes"
        />

        <DistributionCard
          title="Materias aprobadas por alumno"
          items={data.materiasAprobadasAlumno}
          valueKey="students"
          valueLabel="estudiantes"
        />
      </div>

      <CareerSubjectsCard
        items={data.materiasPorCarrera}
      />

      <MonthlyLineChart
        title="Sesiones de estudio creadas por período"
        data={sesionesData}
        footerLeft={`Total de sesiones creadas: ${data.sesionesPeriodo.total}`}
        footerRight={`Promedio mensual: ${data.sesionesPeriodo.promedio}`}
      />

      <TopMaterialsTable
        items={data.materiasConMasMateriales}
        ratingOrder={ratingOrder}
        setRatingOrder={setRatingOrder}
      />

      <div className={styles.twoColumns}>
        <ModerationStats
          stats={data.moderacion}
        />

        <ModerationDonut
          stats={data.moderacion}
        />
      </div>
    </>
  );
}

function ReportesSociales({ data }) {
  const conexionesData =
    data.distribucionConexionesData || [];

  return (
    <>
      <DistributionBarChart
        title="Distribución de conexiones entre estudiantes"
        data={conexionesData}
      />

      <div className={styles.twoColumns}>
        <DistributionCard
          title="Participantes por sesión"
          items={data.participantesPorSesion}
          valueKey="sessions"
          valueLabel="sesiones"
        />

        <OccupancyCard data={data.ocupacion} />
      </div>

      <ActiveCareersTable
        items={data.carrerasActivas}
      />
    </>
  );
}

function MonthlyLineChart({
  title,
  data,
  footerLeft,
  footerRight,
}) {
  return (
    <section className={styles.chartCard}>
      <h2>{title}</h2>

      <div
        style={{
          width: '100%',
          height: 220,
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 8,
              right: 20,
              bottom: 0,
              left: 0,
            }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{
                fontSize: 11,
                fill: '#405a7a',
              }}
            />

            <YAxis
              tick={{
                fontSize: 11,
                fill: '#405a7a',
              }}
              allowDecimals={false}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#00a8c7"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {(footerLeft || footerRight) && (
        <div className={styles.chartFooter}>
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      )}
    </section>
  );
}

function DistributionBarChart({
  title,
  data,
}) {
  return (
    <section className={styles.chartCard}>
      <h2>{title}</h2>

      <div
        style={{
          width: '100%',
          height: 220,
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: 20,
              bottom: 0,
              left: 0,
            }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fontSize: 11,
                fill: '#405a7a',
              }}
            />

            <YAxis
              tick={{
                fontSize: 11,
                fill: '#405a7a',
              }}
              allowDecimals={false}
            />

            <Tooltip />

            <Bar
              dataKey="students"
              fill="#00a8c7"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DistributionCard({
  title,
  items,
  valueKey,
  valueLabel,
}) {
  return (
    <section
      className={`${styles.card} ${styles.scrollTableCard}`}
    >
      <h2>{title}</h2>

      <div className={styles.distributionList}>
        {items.map((item) => (
          <div
            className={styles.distributionItem}
            key={item.label}
          >
            <div
              className={styles.distributionHeader}
            >
              <span>{item.label}</span>

              <span>
                {item[valueKey]} {valueLabel}{' '}
                ({item.percentage}%)
              </span>
            </div>

            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${item.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CareerSubjectsCard({ items }) {
  const maxCursadas = Math.max(
    1,
    ...items.map((item) => item.cursadas)
  );

  const maxAprobadas = Math.max(
    1,
    ...items.map((item) => item.aprobadas)
  );

  return (
    <section className={styles.card}>
      <h2>Materias cursadas por carrera</h2>

      <div className={styles.careerList}>
        {items.map((item) => (
          <div
            className={styles.careerRow}
            key={item.career}
          >
            <h3>{item.career}</h3>

            <div className={styles.careerBars}>
              <div>
                <span>Cursadas</span>

                <div className={styles.barLine}>
                  <div
                    className={styles.barCyan}
                    style={{
                      width: `${
                        (item.cursadas /
                          maxCursadas) *
                        100
                      }%`,
                    }}
                  />

                  <strong>{item.cursadas}</strong>
                </div>
              </div>

              <div>
                <span>Aprobadas</span>

                <div className={styles.barLine}>
                  <div
                    className={styles.barGreen}
                    style={{
                      width: `${
                        (item.aprobadas /
                          maxAprobadas) *
                        100
                      }%`,
                    }}
                  />

                  <strong>
                    {item.aprobadas}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TopMaterialsTable({
  items,
  ratingOrder,
  setRatingOrder,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.tableTitleRow}>
        <h2>
          Materias con más materiales compartidos
        </h2>

        <div className={styles.ratingFilter}>
          <label htmlFor="rating-order">
            Ordenar valoración
          </label>

          <select
            id="rating-order"
            value={ratingOrder}
            onChange={(event) =>
              setRatingOrder(event.target.value)
            }
          >
            <option value="default">
              Orden original
            </option>

            <option value="desc">
              Mayor a menor
            </option>

            <option value="asc">
              Menor a mayor
            </option>
          </select>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Posición</th>
            <th>Materia</th>
            <th>Materiales</th>
            <th>Valoración</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={`${item.subject}-${item.position}`}
            >
              <td>
                <span
                  className={
                    styles.positionBadge
                  }
                >
                  {item.position}
                </span>
              </td>

              <td>{item.subject}</td>
              <td>{item.materials}</td>

              <td>
                <span className={styles.rating}>
                  <ThumbsUp size={15} />
                  {item.rating}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ModerationStats({ stats }) {
  return (
    <section className={styles.card}>
      <h2>Estadísticas de moderación</h2>

      <div className={styles.moderationRows}>
        <p>
          <span>Total de denuncias</span>
          <strong>{stats.total}</strong>
        </p>

        <p>
          <span>Denuncias pendientes</span>

          <strong className={styles.orange}>
            {stats.pendientes}
          </strong>
        </p>

        <p>
          <span>Denuncias aceptadas</span>

          <strong className={styles.red}>
            {stats.aceptadas}
          </strong>
        </p>

        <p>
          <span>Denuncias rechazadas</span>

          <strong className={styles.green}>
            {stats.rechazadas}
          </strong>
        </p>
      </div>
    </section>
  );
}

function ModerationDonut({ stats }) {
  const total = stats.total || 0;

  const pPct =
    total > 0
      ? (stats.pendientes / total) * 100
      : 0;

  const aPct =
    total > 0
      ? (stats.aceptadas / total) * 100
      : 0;

  const donutStyle =
    total > 0
      ? {
          background: `conic-gradient(
            #f59e0b 0 ${pPct}%,
            #ef4444 ${pPct}% ${pPct + aPct}%,
            #22c55e ${pPct + aPct}% 100%
          )`,
        }
      : {
          background: '#e5e7eb',
        };

  return (
    <section className={styles.card}>
      <h2>Distribución de denuncias</h2>

      <div className={styles.donutWrapper}>
        <div
          className={styles.donut}
          style={donutStyle}
        >
          <div>
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <span>
          <i
            className={
              styles.legendOrange
            }
          />
          Pendientes
        </span>

        <span>
          <i
            className={
              styles.legendRed
            }
          />
          Aceptadas
        </span>

        <span>
          <i
            className={
              styles.legendGreen
            }
          />
          Rechazadas
        </span>
      </div>
    </section>
  );
}

function OccupancyCard({ data }) {
  const percentage = data.percentage || 0;

  const donutStyle = {
    background: `conic-gradient(
      #06b6d4 0 ${percentage}%,
      #e5e7eb ${percentage}% 100%
    )`,
  };

  return (
    <section className={styles.card}>
      <h2>Tasa de ocupación de sesiones</h2>

      <div className={styles.donutWrapper}>
        <div
          className={styles.occupancyDonut}
          style={donutStyle}
        >
          <div>
            <strong>
              {data.percentage}%
            </strong>

            <span>Ocupación</span>
          </div>
        </div>
      </div>

      <div className={styles.occupancyRows}>
        <p>
          <span>Cupos llenos</span>

          <strong>
            {data.cuposLlenos} sesiones
          </strong>
        </p>

        <p>
          <span>Con disponibilidad</span>

          <strong>
            {data.conDisponibilidad} sesiones
          </strong>
        </p>
      </div>
    </section>
  );
}

function ActiveCareersTable({ items }) {
  return (
    <section className={styles.card}>
      <h2>
        Carreras con comunidad más activa
      </h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Posición</th>
            <th>Carrera</th>
            <th>Publicaciones</th>
            <th>Sesiones</th>
            <th>Interacciones</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.position}>
              <td>
                <span
                  className={
                    styles.purpleBadge
                  }
                >
                  {item.position}
                </span>
              </td>

              <td>{item.career}</td>
              <td>{item.posts}</td>
              <td>{item.sessions}</td>
              <td>{item.interactions}</td>

              <td>
                <div
                  className={
                    styles.scoreCell
                  }
                >
                  <span
                    style={{
                      width: `${item.score}%`,
                    }}
                  />

                  <strong>{item.score}</strong>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}