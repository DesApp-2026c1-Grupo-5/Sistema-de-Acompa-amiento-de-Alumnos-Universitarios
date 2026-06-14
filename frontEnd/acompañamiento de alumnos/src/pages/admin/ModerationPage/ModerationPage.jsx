import { useEffect, useState, useCallback } from 'react';
import {
    Settings,
    Search,
    FileText,
    Link as LinkIcon,
    Video,
    MessageSquare,
    XCircle,
    Ban,
    AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
    getDenunciasStats,
    getDenunciasAdmin,
    getDenunciaMaterialDetail,
    rechazarDenunciasMaterial,
    suspenderMaterialAdmin,
    restaurarMaterialAdmin,
} from '../../../services/denunciaAdminService';
import styles from './ModerationPage.module.css';

const SEVERIDAD_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' };
const ESTADO_LABEL = {
    pendiente: 'Pendiente',
    rechazada: 'Rechazada',
    suspendido: 'Suspendido',
};
const COMPLAINT_ESTADO_LABEL = {
    pendiente: 'Pendiente',
    rechazada: 'Rechazada',
};

function mapListItem(it) {
    const uploader = it.uploader ?? {};
    return {
        id: it.material.id,
        titulo: it.material.titulo,
        tipo: it.material.tipo,
        suspendido: it.material.suspendido,
        subidoPor: `${uploader.nombre ?? ''} ${uploader.apellido ?? ''}`.trim() || 'Sin uploader',
        cantidad: it.cantidad_denuncias,
        severidad: it.severidad,
        estado: it.estado_resumen,
    };
}

function mapDetail(data) {
    const uploader = data.uploader ?? {};
    return {
        id: data.material.id,
        titulo: data.material.titulo,
        tipo: data.material.tipo,
        suspendido: data.material.suspendido,
        subidoPor: `${uploader.nombre ?? ''} ${uploader.apellido ?? ''}`.trim() || 'Sin uploader',
        cantidad: data.cantidad_denuncias,
        estado: data.estado_resumen,
        denuncias: (data.denuncias ?? []).map((d) => ({
            id: d.id,
            motivo: d.motivo?.nombre ?? 'Sin motivo',
            detalle: d.detalle ?? '',
            estado: d.estado,
            denunciante: d.denunciante
                ? `${d.denunciante.nombre} ${d.denunciante.apellido}`.trim()
                : '—',
            fecha: d.fecha_creacion ? new Date(d.fecha_creacion).toLocaleDateString('es-AR') : '',
        })),
    };
}

function ModerationPage() {
    const navigate = useNavigate();

    const [materials, setMaterials] = useState([]);
    const [stats, setStats] = useState({ pendientes: 0, verificadas: 0, materiales_suspendidos: 0 });
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await getDenunciasStats();
            setStats(res.data);
        } catch (err) {
            setListError(err.message || 'No pudimos cargar las estadísticas.');
        }
    }, []);

    const fetchList = useCallback(async ({ q, estado }) => {
        try {
            const res = await getDenunciasAdmin({ q, estado });
            const items = (res.data ?? []).map(mapListItem);
            setMaterials(items);
            return items;
        } catch (err) {
            setListError(err.message || 'No pudimos cargar la lista de denuncias.');
            return [];
        }
    }, []);

    const fetchDetail = useCallback(async (materialId) => {
        if (!materialId) {
            setSelectedDetail(null);
            return;
        }
        try {
            const res = await getDenunciaMaterialDetail(materialId);
            setSelectedDetail(mapDetail(res.data));
        } catch (err) {
            setActionError(err.message || 'No pudimos cargar el detalle del material.');
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            await fetchStats();
            const items = await fetchList({ q: '', estado: 'todos' });
            if (cancelled) return;
            if (items.length > 0) {
                setSelectedId(items[0].id);
                await fetchDetail(items[0].id);
            }
            setLoading(false);
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [fetchStats, fetchList, fetchDetail]);

    useEffect(() => {
        if (loading) return;
        const timer = setTimeout(async () => {
            const items = await fetchList({ q: search, estado: statusFilter });
            if (selectedId && !items.find((it) => it.id === selectedId)) {
                setSelectedId(items[0]?.id ?? null);
                if (items[0]) {
                    fetchDetail(items[0].id);
                } else {
                    setSelectedDetail(null);
                }
            }
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);

    const handleSelectMaterial = (material) => {
        setSelectedId(material.id);
        setActionError('');
        fetchDetail(material.id);
        if (window.innerWidth <= 768) setDetailModalOpen(true);
    };

    const runAction = async (actionFn) => {
        if (!selectedDetail) return;
        setActionError('');
        setActionLoading(true);
        try {
            await actionFn(selectedDetail.id);
            await Promise.all([
                fetchStats(),
                fetchList({ q: search, estado: statusFilter }),
                fetchDetail(selectedDetail.id),
            ]);
        } catch (err) {
            setActionError(err.message || 'No pudimos completar la acción.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = () => runAction(rechazarDenunciasMaterial);
    const handleSuspend = () => {
        if (!selectedDetail) return;
        runAction(selectedDetail.suspendido ? restaurarMaterialAdmin : suspenderMaterialAdmin);
    };

    const getIcon = (tipo) => {
        const lowerTipo = (tipo || '').toLowerCase();
        if (lowerTipo.includes('link')) return <LinkIcon size={18} />;
        if (lowerTipo.includes('video') || lowerTipo.includes('youtube')) return <Video size={18} />;
        if (lowerTipo.includes('discord')) return <MessageSquare size={18} />;
        return <FileText size={18} />;
    };

    const getStatusBadgeClass = (estado) => {
        if (estado === 'suspendido') return styles.statusSuspended;
        if (estado === 'rechazada') return styles.statusRejected;
        return styles.statusPending;
    };

    const getComplaintStatusClass = (estado) => {
        if (estado === 'rechazada') return styles.complaintRejected;
        return styles.complaintPending;
    };

    if (loading) {
        return <p className={styles.loading}>Cargando denuncias...</p>;
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Denuncias</h1>
                    <p>Gestión de materiales denunciados por usuarios</p>
                </div>

                <button
                    type="button"
                    className={styles.configButton}
                    onClick={() => navigate('/admin/complaint-config')}
                >
                    <Settings size={16} />
                    Configuración
                </button>
            </header>

            <section className={styles.summaryGrid}>
                <article className={`${styles.summaryCard} ${styles.pendingLine}`}>
                    <span>Denuncias pendientes</span>
                    <strong>{stats.pendientes}</strong>
                </article>

                <article className={`${styles.summaryCard} ${styles.verifiedLine}`}>
                    <span>Denuncias verificadas</span>
                    <strong>{stats.verificadas}</strong>
                </article>

                <article className={`${styles.summaryCard} ${styles.suspendedLine}`}>
                    <span>Materiales suspendidos</span>
                    <strong>{stats.materiales_suspendidos}</strong>
                </article>
            </section>

            {listError && <p className={styles.actionError}>{listError}</p>}

            <section className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    <Search size={17} />
                    <input
                        type="text"
                        placeholder="Buscar material o usuario..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazada">Rechazada</option>
                    <option value="suspendido">Suspendido</option>
                </select>
            </section>

            <div className={styles.content}>
                <section className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <span>Material</span>
                        <span>Usuario</span>
                        <span>Denuncias</span>
                        <span>Estado</span>
                    </div>

                    <div className={styles.tableBody}>
                        {materials.length === 0 && (
                            <p className={styles.loading}>No se encontraron materiales denunciados.</p>
                        )}

                        {materials.map((material) => {
                            const sev = material.severidad;
                            return (
                                <button
                                    type="button"
                                    key={material.id}
                                    className={`${styles.tableRow} ${selectedId === material.id ? styles.activeRow : ''}`}
                                    onClick={() => handleSelectMaterial(material)}
                                >
                                    <div className={styles.materialCell}>
                                        <div className={styles.materialIcon}>{getIcon(material.tipo)}</div>

                                        <div>
                                            <strong>{material.titulo}</strong>
                                            <span>{material.tipo}</span>
                                        </div>
                                    </div>

                                    <span className={styles.userCell}>{material.subidoPor}</span>

                                    <div className={styles.reportCell}>
                                        <strong>{material.cantidad}</strong>
                                        <span
                                            className={`${styles.riskBadge} ${sev === 'alta' ? styles.high : sev === 'media' ? styles.medium : styles.low}`}
                                        >
                                            {SEVERIDAD_LABEL[sev] ?? 'Baja'}
                                        </span>
                                    </div>

                                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(material.estado)}`}>
                                        {ESTADO_LABEL[material.estado] ?? 'Pendiente'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {selectedDetail && detailModalOpen && (
                    <div className={styles.detailOverlay} onClick={() => setDetailModalOpen(false)} />
                )}

                {selectedDetail && (
                    <aside className={`${styles.detailPanel} ${detailModalOpen ? styles.detailModalOpen : ''}`}>
                        <button
                            type="button"
                            className={styles.closeDetailButton}
                            onClick={() => setDetailModalOpen(false)}
                        >
                            ×
                        </button>

                        <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>{getIcon(selectedDetail.tipo)}</div>

                            <div>
                                <h2>{selectedDetail.titulo}</h2>
                                <p>Subido por {selectedDetail.subidoPor}</p>
                            </div>
                        </div>

                        <div className={styles.detailInfo}>
                            <p>
                                <span>Tipo:</span>
                                <strong>{selectedDetail.tipo}</strong>
                            </p>

                            <p>
                                <span>Denuncias:</span>
                                <strong>{selectedDetail.cantidad}</strong>
                            </p>

                            <p>
                                <span>Estado:</span>
                                <strong className={`${styles.statusBadge} ${getStatusBadgeClass(selectedDetail.estado)}`}>
                                    {ESTADO_LABEL[selectedDetail.estado] ?? 'Pendiente'}
                                </strong>
                            </p>
                        </div>

                        {actionError && <p className={styles.actionError}>{actionError}</p>}

                        <div className={styles.complaintsBlock}>
                            <h3>
                                <AlertTriangle size={16} />
                                Denuncias recibidas
                            </h3>

                            <div className={styles.complaintsList}>
                                {selectedDetail.denuncias.length === 0 && (
                                    <p className={styles.loading}>Sin denuncias.</p>
                                )}

                                {selectedDetail.denuncias.map((denuncia) => (
                                    <article key={denuncia.id} className={styles.complaintCard}>
                                        <div className={styles.complaintHeader}>
                                            <strong>{denuncia.motivo}</strong>

                                            <span className={`${styles.complaintStatus} ${getComplaintStatusClass(denuncia.estado)}`}>
                                                {COMPLAINT_ESTADO_LABEL[denuncia.estado] ?? denuncia.estado}
                                            </span>
                                        </div>

                                        {denuncia.detalle && <p>{denuncia.detalle}</p>}

                                        <div className={styles.complaintMeta}>
                                            <span>{denuncia.denunciante}</span>
                                            <span>{denuncia.fecha}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className={styles.actions}>

                            <button
                                type="button"
                                className={styles.rejectButton}
                                onClick={handleReject}
                                disabled={actionLoading}
                            >
                                <XCircle size={16} />
                                Rechazar denuncia
                            </button>

                            <button
                                type="button"
                                className={styles.suspendButton}
                                onClick={handleSuspend}
                                disabled={actionLoading}
                            >
                                <Ban size={16} />
                                {selectedDetail.suspendido ? 'Restaurar material' : 'Suspender material'}
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </section>
    );
}

export default ModerationPage;
