import { useEffect, useMemo, useState } from 'react';
import {
    Settings,
    Search,
    FileText,
    Link as LinkIcon,
    Video,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Ban,
    AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import styles from './ModerationPage.module.css';

function ModerationPage() {
    const navigate = useNavigate();

    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getMaterials = async () => {
            try {
                const response = await fetch('/data/moderationMaterials.json');
                const data = await response.json();

                setMaterials(data.materials);
                setSelectedMaterial(data.materials[0]);
            } catch (error) {
                console.error('Error cargando denuncias:', error);
            } finally {
                setLoading(false);
            }
        };

        getMaterials();
    }, []);

    const filteredMaterials = useMemo(() => {
        return materials.filter((material) => {
            const matchesSearch =
                material.titulo.toLowerCase().includes(search.toLowerCase()) ||
                material.subidoPor.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === 'todos' || material.estado === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [materials, search, statusFilter]);

    const summary = useMemo(() => {
        return {
            pendientes: materials.reduce(
                (acc, material) => acc + material.denunciasPendientes,
                0
            ),
            verificadas: materials.reduce(
                (acc, material) => acc + material.denunciasVerificadas,
                0
            ),
            suspendidos: materials.filter(
                (material) => material.estado === 'suspendido'
            ).length,
        };
    }, [materials]);

    const getIcon = (tipo) => {
        const lowerTipo = tipo.toLowerCase();

        if (lowerTipo.includes('link')) return <LinkIcon size={18} />;
        if (lowerTipo.includes('video') || lowerTipo.includes('youtube')) {
            return <Video size={18} />;
        }
        if (lowerTipo.includes('discord')) return <MessageSquare size={18} />;

        return <FileText size={18} />;
    };

    const getRiskLabel = (total) => {
        if (total >= 8) return 'Alta';
        if (total >= 4) return 'Media';
        return 'Baja';
    };

    const handleConfirm = () => {
        if (!selectedMaterial) return;

        setMaterials((prevMaterials) =>
            prevMaterials.map((material) =>
                material.id === selectedMaterial.id
                    ? {
                        ...material,
                        denunciasVerificadas: material.denunciasVerificadas + 1,
                    }
                    : material
            )
        );
    };

    const handleReject = () => {
        console.log('Denuncia rechazada:', selectedMaterial);
    };

    const handleSuspend = () => {
        if (!selectedMaterial) return;

        const nextStatus =
            selectedMaterial.estado === 'suspendido' ? 'activo' : 'suspendido';

        setMaterials((prevMaterials) =>
            prevMaterials.map((material) =>
                material.id === selectedMaterial.id
                    ? { ...material, estado: nextStatus }
                    : material
            )
        );

        setSelectedMaterial((prev) => ({
            ...prev,
            estado: nextStatus,
        }));
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
                    <strong>{summary.pendientes}</strong>
                </article>

                <article className={`${styles.summaryCard} ${styles.verifiedLine}`}>
                    <span>Denuncias verificadas</span>
                    <strong>{summary.verificadas}</strong>
                </article>

                <article className={`${styles.summaryCard} ${styles.suspendedLine}`}>
                    <span>Materiales suspendidos</span>
                    <strong>{summary.suspendidos}</strong>
                </article>
            </section>

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
                    <option value="activo">Pendiente</option>
                    <option value="verificada">Verificada</option>
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
                        {filteredMaterials.map((material) => {
                            const totalDenuncias =
                                material.denunciasPendientes + material.denunciasVerificadas;

                            return (
                                <button
                                    type="button"
                                    key={material.id}
                                    className={`${styles.tableRow} ${selectedMaterial?.id === material.id ? styles.activeRow : ''
                                        }`}
                                    onClick={() => setSelectedMaterial(material)}
                                >
                                    <div className={styles.materialCell}>
                                        <div className={styles.materialIcon}>
                                            {getIcon(material.tipo)}
                                        </div>

                                        <div>
                                            <strong>{material.titulo}</strong>
                                            <span>{material.tipo}</span>
                                        </div>
                                    </div>

                                    <span className={styles.userCell}>{material.subidoPor}</span>

                                    <div className={styles.reportCell}>
                                        <strong>{totalDenuncias}</strong>
                                        <span
                                            className={`${styles.riskBadge} ${totalDenuncias >= 8
                                                    ? styles.high
                                                    : totalDenuncias >= 4
                                                        ? styles.medium
                                                        : styles.low
                                                }`}
                                        >
                                            {getRiskLabel(totalDenuncias)}
                                        </span>
                                    </div>

                                    <span
                                        className={`${styles.statusBadge} ${material.estado === 'suspendido'
                                                ? styles.statusSuspended
                                                : material.estado === 'rechazada'
                                                    ? styles.statusRejected
                                                    : material.estado === 'verificada'
                                                        ? styles.statusVerified
                                                        : styles.statusPending
                                            }`}
                                    >
                                        {material.estado === 'suspendido'
                                            ? 'Suspendido'
                                            : material.estado === 'rechazada'
                                                ? 'Rechazado'
                                                : material.estado === 'verificada'
                                                    ? 'Verificado'
                                                    : 'Pendiente'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {selectedMaterial && (
                    <aside className={styles.detailPanel}>
                        <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>{getIcon(selectedMaterial.tipo)}</div>

                            <div>
                                <h2>{selectedMaterial.titulo}</h2>
                                <p>Subido por {selectedMaterial.subidoPor}</p>
                            </div>
                        </div>

                        <div className={styles.detailInfo}>
                            <p>
                                <span>Tipo:</span>
                                <strong>{selectedMaterial.tipo}</strong>
                            </p>

                            <p>
                                <span>Denuncias:</span>
                                <strong>
                                    {selectedMaterial.denunciasPendientes +
                                        selectedMaterial.denunciasVerificadas}
                                </strong>
                            </p>

                            <p>
                                <span>Estado:</span>
                                <strong
                                    className={`${styles.statusBadge} ${selectedMaterial.estado === 'suspendido'
                                            ? styles.statusSuspended
                                            : styles.statusPending
                                        }`}
                                >
                                    {selectedMaterial.estado === 'suspendido'
                                        ? 'Suspendido'
                                        : 'Pendiente'}
                                </strong>
                            </p>
                        </div>

                        <div className={styles.complaintsBlock}>
                            <h3>
                                <AlertTriangle size={16} />
                                Denuncias recibidas
                            </h3>

                            <div className={styles.complaintsList}>
                                {selectedMaterial.denuncias.map((denuncia) => (
                                    <article key={denuncia.id} className={styles.complaintCard}>
                                        <div className={styles.complaintHeader}>
                                            <strong>{denuncia.motivo}</strong>

                                            <span
                                                className={`${styles.complaintStatus} ${denuncia.estado === 'pendiente'
                                                        ? styles.complaintPending
                                                        : denuncia.estado === 'verificada'
                                                            ? styles.complaintVerified
                                                            : styles.complaintRejected
                                                    }`}
                                            >
                                                {denuncia.estado}
                                            </span>
                                        </div>

                                        <p>{denuncia.descripcion}</p>

                                        <div className={styles.complaintMeta}>
                                            <span>{denuncia.denuncianteNombre}</span>
                                            <span>{denuncia.fecha}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.confirmButton}
                                onClick={handleConfirm}
                            >
                                <CheckCircle2 size={16} />
                                Posponer 7 días
                            </button>

                            <button
                                type="button"
                                className={styles.rejectButton}
                                onClick={handleReject}
                            >
                                <XCircle size={16} />
                                Rechazar denuncia
                            </button>

                            <button
                                type="button"
                                className={styles.suspendButton}
                                onClick={handleSuspend}
                            >
                                <Ban size={16} />
                                {selectedMaterial.estado === 'suspendido'
                                    ? 'Restaurar material'
                                    : 'Suspender material'}
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </section>
    );
}

export default ModerationPage;