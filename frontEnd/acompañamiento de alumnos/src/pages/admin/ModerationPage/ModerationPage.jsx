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
    EyeOff,
    Eye,
    AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
    getDenunciasStats,
    getDenunciasAdmin,
    getDenunciaMaterialDetail,
    getDenunciaPostDetail,
    rechazarDenunciasMaterial,
    suspenderMaterialAdmin,
    restaurarMaterialAdmin,
    rechazarDenunciasPost,
    ocultarPostAdmin,
    mostrarPostAdmin,
} from '../../../services/denunciaAdminService';
import Pagination from '../../../components/common/Pagination';
import styles from './ModerationPage.module.css';

const PAGE_SIZE = 6;

const SEVERIDAD_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' };
const ESTADO_LABEL = {
    pendiente: 'Pendiente',
    rechazada: 'Rechazada',
    suspendido: 'Suspendido',
    oculto: 'Oculta',
};
const COMPLAINT_ESTADO_LABEL = {
    pendiente: 'Pendiente',
    rechazada: 'Rechazada',
};

function mapListItem(it) {
    const uploader = it.uploader ?? {};
    const descripcion = it.descripcion ?? '';
    return {
        id: it.recurso_id,
        tipo: it.tipo,
        descripcion: descripcion.length > 60 ? descripcion.substring(0, 60) + '...' : descripcion,
        categoria: it.categoria,
        subidoPor: `${uploader.nombre ?? ''} ${uploader.apellido ?? ''}`.trim() || 'Sin usuario',
        cantidad: it.cantidad_denuncias,
        severidad: it.severidad,
        estado: it.estado_resumen,
    };
}

function mapDetail(data) {
    const uploader = data.uploader ?? {};

    if (data.material) {
        return {
            tipo: 'material',
            id: data.material.id,
            titulo: data.material.titulo,
            tipoMaterial: data.material.tipo,
            suspendido: data.material.suspendido,
            subidoPor: `${uploader.nombre ?? ''} ${uploader.apellido ?? ''}`.trim() || 'Sin usuario',
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

    if (data.post) {
        return {
            tipo: 'post',
            id: data.post.id,
            contenido: data.post.contenido,
            oculto: data.post.oculto,
            subidoPor: `${uploader.nombre ?? ''} ${uploader.apellido ?? ''}`.trim() || 'Sin usuario',
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

    return null;
}

function ModerationPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [stats, setStats] = useState({ pendientes: 0, verificadas: 0, materiales_suspendidos: 0, posts_ocultos: 0 });
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [selectedKey, setSelectedKey] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    const fetchList = useCallback(async ({ q, estado, page }) => {
        try {
            const res = await getDenunciasAdmin({ q, estado, page, limit: PAGE_SIZE });
            const mapped = (res.data ?? []).map(mapListItem);
            setItems(mapped);
            setTotalPages(res.pagination?.totalPages ?? 1);
            return mapped;
        } catch (err) {
            setListError(err.message || 'No pudimos cargar la lista de denuncias.');
            return [];
        }
    }, []);

    const fetchDetail = useCallback(async (item) => {
        if (!item) {
            setSelectedDetail(null);
            return;
        }
        try {
            const res = item.tipo === 'material'
                ? await getDenunciaMaterialDetail(item.id)
                : await getDenunciaPostDetail(item.id);
            setSelectedDetail(mapDetail(res.data));
        } catch (err) {
            setActionError(err.message || 'No pudimos cargar el detalle.');
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            await fetchStats();
            const mapped = await fetchList({ q: '', estado: 'todos', page: 1 });
            if (cancelled) return;
            if (mapped.length > 0) {
                setSelectedKey(`${mapped[0].tipo}-${mapped[0].id}`);
                await fetchDetail(mapped[0]);
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
            setPage(1);
            const mapped = await fetchList({ q: search, estado: statusFilter, page: 1 });
            if (selectedKey && !mapped.find((it) => `${it.tipo}-${it.id}` === selectedKey)) {
                setSelectedKey(mapped[0] ? `${mapped[0].tipo}-${mapped[0].id}` : null);
                if (mapped[0]) {
                    fetchDetail(mapped[0]);
                } else {
                    setSelectedDetail(null);
                }
            }
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);

    const handlePageChange = (n) => {
        setPage(n);
        fetchList({ q: search, estado: statusFilter, page: n });
    };

    const handleSelectItem = (item) => {
        setSelectedKey(`${item.tipo}-${item.id}`);
        setActionError('');
        fetchDetail(item);
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
                fetchList({ q: search, estado: statusFilter, page }),
                fetchDetail(items.find((it) => `${it.tipo}-${it.id}` === selectedKey)),
            ]);
        } catch (err) {
            setActionError(err.message || 'No pudimos completar la acción.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = () => {
        if (!selectedDetail) return;
        const fn = selectedDetail.tipo === 'material'
            ? rechazarDenunciasMaterial
            : rechazarDenunciasPost;
        runAction(fn);
    };

    const handleSuspendOcultar = () => {
        if (!selectedDetail) return;
        if (selectedDetail.tipo === 'material') {
            if (selectedDetail.suspendido) {
                runAction(restaurarMaterialAdmin);
            } else {
                runAction(suspenderMaterialAdmin);
            }
        } else {
            if (selectedDetail.oculto) {
                runAction(mostrarPostAdmin);
            } else {
                runAction(ocultarPostAdmin);
            }
        }
    };

    const getIcon = (tipo) => {
        if (tipo === 'post') return <MessageSquare size={18} />;
        const lowerTipo = (tipo || '').toLowerCase();
        if (lowerTipo.includes('link')) return <LinkIcon size={18} />;
        if (lowerTipo.includes('video') || lowerTipo.includes('youtube')) return <Video size={18} />;
        if (lowerTipo.includes('discord')) return <MessageSquare size={18} />;
        return <FileText size={18} />;
    };

    const getStatusBadgeClass = (estado) => {
        if (estado === 'suspendido' || estado === 'oculto') return styles.statusSuspended;
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
                    <p>Gestión de materiales y publicaciones denunciados por usuarios</p>
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

                <article className={`${styles.summaryCard} ${styles.ocultoLine}`}>
                    <span>Publicaciones ocultas</span>
                    <strong>{stats.posts_ocultos}</strong>
                </article>
            </section>

            {listError && <p className={styles.actionError}>{listError}</p>}

            <section className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    <Search size={17} />
                    <input
                        type="text"
                        placeholder="Buscar descripción o usuario..."
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
                    <option value="oculto">Oculta</option>
                </select>
            </section>

            <div className={styles.content}>
                <section className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <span>Descripción</span>
                        <span>Usuario</span>
                        <span>Denuncias</span>
                        <span>Estado</span>
                        <span>Categoría</span>
                    </div>

                    <div className={styles.tableBody}>
                        {items.length === 0 && (
                            <p className={styles.loading}>No se encontraron denuncias.</p>
                        )}

                        {items.map((item) => {
                            const sev = item.severidad;
                            return (
                                <button
                                    type="button"
                                    key={`${item.tipo}-${item.id}`}
                                    className={`${styles.tableRow} ${selectedKey === `${item.tipo}-${item.id}` ? styles.activeRow : ''}`}
                                    onClick={() => handleSelectItem(item)}
                                >
                                    <div className={styles.materialCell}>
                                        <div className={styles.materialIcon}>{getIcon(item.tipo)}</div>
                                        <div>
                                            <strong>{item.descripcion}</strong>
                                        </div>
                                    </div>

                                    <span className={styles.userCell}>{item.subidoPor}</span>

                                    <div className={styles.reportCell}>
                                        <strong>{item.cantidad}</strong>
                                        <span
                                            className={`${styles.riskBadge} ${sev === 'alta' ? styles.high : sev === 'media' ? styles.medium : styles.low}`}
                                        >
                                            {SEVERIDAD_LABEL[sev] ?? 'Baja'}
                                        </span>
                                    </div>

                                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.estado)}`}>
                                        {ESTADO_LABEL[item.estado] ?? 'Pendiente'}
                                    </span>

                                    <span className={styles.categoryCell}>{item.categoria}</span>
                                </button>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.paginationSection}>
                            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                        </div>
                    )}
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

                        {selectedDetail.tipo === 'material' ? (
                            <>
                                <div className={styles.detailHeader}>
                                    <div className={styles.detailIcon}>{getIcon(selectedDetail.tipoMaterial)}</div>
                                    <div>
                                        <h2>{selectedDetail.titulo}</h2>
                                        <p>Subido por {selectedDetail.subidoPor}</p>
                                    </div>
                                </div>

                                <div className={styles.detailInfo}>
                                    <p>
                                        <span>Tipo:</span>
                                        <strong>{selectedDetail.tipoMaterial}</strong>
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
                            </>
                        ) : (
                            <>
                                <div className={styles.detailHeader}>
                                    <div className={styles.detailIcon}>{getIcon('post')}</div>
                                    <div>
                                        <h2>Publicación</h2>
                                        <p>Publicado por {selectedDetail.subidoPor}</p>
                                    </div>
                                </div>

                                <div className={styles.detailPostContent}>
                                    <p>{selectedDetail.contenido}</p>
                                </div>

                                <div className={styles.detailInfo}>
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
                            </>
                        )}

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
                                onClick={handleSuspendOcultar}
                                disabled={actionLoading}
                            >
                                {selectedDetail.tipo === 'material' ? (
                                    <>
                                        <Ban size={16} />
                                        {selectedDetail.suspendido ? 'Restaurar material' : 'Suspender material'}
                                    </>
                                ) : (
                                    <>
                                        {selectedDetail.oculto ? <Eye size={16} /> : <EyeOff size={16} />}
                                        {selectedDetail.oculto ? 'Mostrar publicación' : 'Ocultar publicación'}
                                    </>
                                )}
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </section>
    );
}

export default ModerationPage;
