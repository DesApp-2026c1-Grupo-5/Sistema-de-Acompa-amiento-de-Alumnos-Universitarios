import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

import { getMaterial } from '../../services/materialService';
import {
    getMotivosDenuncia,
    createDenuncia,
} from '../../services/denunciaService';
import styles from './ReportMaterial.module.css';

export default function ReportMaterial() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [material, setMaterial] = useState(null);
    const [motivos, setMotivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [formData, setFormData] = useState({
        motivo: '',
        detalle: '',
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [materialRes, motivosRes] = await Promise.all([
                    getMaterial(id),
                    getMotivosDenuncia(),
                ]);

                setMaterial(materialRes.data);
                setMotivos(motivosRes.data);
            } catch (err) {
                setError(err.message || 'No pudimos cargar el material.');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setSubmitError(null);

        try {
            const detalle = formData.detalle.trim();

            await createDenuncia(id, {
                motivo_id: Number(formData.motivo),
                ...(detalle ? { detalle } : {}),
            });

            setSubmitSuccess(true);
        } catch (err) {
            setSubmitError(err.message || 'No pudimos enviar la denuncia.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>Denunciar material</h1>
                    </div>
                    <div className={styles.content}>
                        <p className={styles.statusText}>
                            Cargando información del material...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !material) {
        return (
            <section className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>Denunciar material</h1>
                    </div>
                    <div className={styles.content}>
                        <p className={styles.statusText}>
                            {error || 'No encontramos el material que querés denunciar.'}
                        </p>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => navigate('/student/materials')}
                        >
                            Volver a materiales
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (submitSuccess) {
        return (
            <section className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>Denuncia enviada</h1>
                    </div>
                    <div className={`${styles.content} ${styles.feedbackContent}`}>
                        <div className={`${styles.feedbackIcon} ${styles.feedbackIconSuccess}`}>
                            <CheckCircle2 size={56} />
                        </div>
                        <h2 className={styles.feedbackTitle}>¡Denuncia enviada con éxito!</h2>
                        <p className={styles.feedbackMessage}>
                            Nuestro equipo revisará el material denunciado lo antes posible.
                        </p>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => navigate('/student/materials')}
                        >
                            Volver a materiales
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (material.mi_denuncia_pendiente) {
        return (
            <section className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>Denunciar material</h1>
                    </div>
                    <div className={`${styles.content} ${styles.feedbackContent}`}>
                        <div className={`${styles.feedbackIcon} ${styles.feedbackIconInfo}`}>
                            <AlertCircle size={56} />
                        </div>
                        <h2 className={styles.feedbackTitle}>Ya denunciaste este material</h2>
                        <p className={styles.feedbackMessage}>
                            Tu denuncia sobre <strong>{material.titulo}</strong> está pendiente de revisión.
                        </p>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => navigate('/student/materials')}
                        >
                            Volver a materiales
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Denunciar material</h1>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={() => navigate('/student/materials')}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.content}>
                        <p className={styles.material}>
                            <span>Material:</span> {material.titulo}
                        </p>

                        <div className={styles.field}>
                            <label>Motivo *</label>

                            <select
                                name="motivo"
                                value={formData.motivo}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            >
                                <option value="">Seleccionar motivo</option>

                                {motivos.map((motivo) => (
                                    <option key={motivo.id} value={motivo.id}>
                                        {motivo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Detalle</label>

                            <textarea
                                name="detalle"
                                placeholder="Describe el motivo de la denuncia..."
                                value={formData.detalle}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>

                        {submitError && (
                            <p className={`${styles.statusText} ${styles.errorText}`}>
                                {submitError}
                            </p>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => navigate('/student/materials')}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={submitting}
                        >
                            {submitting ? 'Enviando…' : 'Enviar denuncia'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
