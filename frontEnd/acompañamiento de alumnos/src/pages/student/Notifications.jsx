import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Calendar,
    FileText,
    GraduationCap,
    CheckCheck,
    Trash2,
    ExternalLink,
    Clock,
} from 'lucide-react';

import {
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '../../services/notificacionService';
import styles from './Notifications.module.css';

const TYPE_CONFIG = {
    academic: {
        label: 'Académica',
        icon: GraduationCap,
        className: 'academic',
    },
    session: {
        label: 'Sesión',
        icon: Calendar,
        className: 'session',
    },
    material: {
        label: 'Material',
        icon: FileText,
        className: 'material',
    },
};

function formatRelativeDate(dateValue) {
    const date = new Date(dateValue);
    const now = new Date();

    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Hace 1 día';

    return `Hace ${diffDays} días`;
}

export default function Notifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        try {
            const response = await getNotifications();
            setNotifications(response.data ?? []);
        } catch (error) {
            console.error(error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadNotifications();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadNotifications]);

    const unreadCount = notifications.filter((notification) => !notification.read).length;

    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            const matchType =
                typeFilter === 'all' || notification.type === typeFilter;

            const matchStatus =
                statusFilter === 'all' ||
                (statusFilter === 'unread' && !notification.read) ||
                (statusFilter === 'read' && notification.read);

            return matchType && matchStatus;
        });
    }, [notifications, typeFilter, statusFilter]);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            await loadNotifications();
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            await loadNotifications();
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            await loadNotifications();
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewDetail = (notification) => {
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            return;
        }

        alert(notification.message);
    };

    if (loading) {
        return <p className={styles.loading}>Cargando notificaciones...</p>;
    }

    return (
        <section className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Notificaciones</h1>
                    <p>
                        {unreadCount > 0
                            ? `Tenés ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                            : 'Todas tus notificaciones están al día'}
                    </p>
                </div>

                {notifications.length > 0 && (
                    <button
                        type="button"
                        className={styles.markAllButton}
                        onClick={handleMarkAllAsRead}
                    >
                        <CheckCheck size={16} />
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <section className={styles.filtersCard}>
                <h2>Filtros</h2>

                <div className={styles.filtersGrid}>
                    <div>
                        <span className={styles.filterLabel}>Tipo de notificación</span>

                        <div className={styles.filterButtons}>
                            <button
                                type="button"
                                className={typeFilter === 'all' ? styles.activeFilter : ''}
                                onClick={() => setTypeFilter('all')}
                            >
                                Todas
                            </button>

                            <button
                                type="button"
                                className={typeFilter === 'academic' ? styles.activeFilter : ''}
                                onClick={() => setTypeFilter('academic')}
                            >
                                Académicas
                            </button>

                            <button
                                type="button"
                                className={typeFilter === 'session' ? styles.activeFilter : ''}
                                onClick={() => setTypeFilter('session')}
                            >
                                Sesiones
                            </button>

                            <button
                                type="button"
                                className={typeFilter === 'material' ? styles.activeFilter : ''}
                                onClick={() => setTypeFilter('material')}
                            >
                                Materiales
                            </button>
                        </div>
                    </div>

                    <div>
                        <span className={styles.filterLabel}>Estado</span>

                        <div className={styles.filterButtons}>
                            <button
                                type="button"
                                className={statusFilter === 'all' ? styles.activeFilter : ''}
                                onClick={() => setStatusFilter('all')}
                            >
                                Todas
                            </button>

                            <button
                                type="button"
                                className={statusFilter === 'unread' ? styles.activeFilter : ''}
                                onClick={() => setStatusFilter('unread')}
                            >
                                No leídas
                            </button>

                            <button
                                type="button"
                                className={statusFilter === 'read' ? styles.activeFilter : ''}
                                onClick={() => setStatusFilter('read')}
                            >
                                Leídas
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {filteredNotifications.length === 0 ? (
                <section className={styles.emptyCard}>
                    <div className={styles.emptyIcon}>
                        <Bell size={32} />
                    </div>

                    <h2>No hay notificaciones</h2>
                    <p>No se encontraron notificaciones con los filtros seleccionados</p>
                </section>
            ) : (
                <section className={styles.notificationsList}>
                    {filteredNotifications.map((notification) => {
                        const config = TYPE_CONFIG[notification.type] ?? {
                            icon: Bell,
                            className: 'academic',
                        };
                        const Icon = config.icon;

                        return (
                            <article
                                key={notification.id}
                                className={`${styles.notificationCard} ${!notification.read ? styles.unreadCard : ''
                                    }`}
                            >
                                <div
                                    className={`${styles.notificationIcon} ${styles[config.className]
                                        }`}
                                >
                                    <Icon size={18} />
                                </div>

                                <div className={styles.notificationContent}>
                                    <div className={styles.notificationTitleRow}>
                                        <h3>{notification.title}</h3>

                                        <span
                                            className={`${styles.categoryBadge} ${styles[config.className]
                                                }`}
                                        >
                                            {notification.category}
                                        </span>
                                    </div>

                                    <p>{notification.message}</p>

                                    <span className={styles.date}>
                                        <Clock size={13} />
                                        {formatRelativeDate(notification.date)}
                                    </span>
                                </div>

                                <div className={styles.actions}>
                                    {!notification.read ? (
                                        <button
                                            type="button"
                                            className={styles.readButton}
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            <CheckCheck size={15} />
                                            Marcar como leída
                                        </button>
                                    ) : (
                                        <span className={styles.readLabel}>
                                            <CheckCheck size={15} />
                                            Leída
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        className={styles.detailButton}
                                        onClick={() => handleViewDetail(notification)}
                                    >
                                        <ExternalLink size={15} />
                                        Ver detalle
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.deleteButton}
                                        onClick={() => handleDelete(notification.id)}
                                        aria-label="Eliminar notificación"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </section>
    );
}
