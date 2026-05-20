import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getMaterial } from '../../services/materialService';
import styles from './ReportMaterial.module.css';

export default function ReportMaterial() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [material, setMaterial] = useState(null);
    const [motivos, setMotivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        motivo: '',
        detalle: '',
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [materialRes, motivosResponse] = await Promise.all([
                    getMaterial(id),
                    fetch('/data/reportReasons.json'),
                ]);

                const motivosData = await motivosResponse.json();

                setMaterial(materialRes.data);
                setMotivos(motivosData);
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

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log('Denuncia enviada:', {
            materialId: id,
            ...formData,
        });

        alert('Denuncia enviada correctamente');

        navigate('/student/materials');
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
                            >
                                <option value="">Seleccionar motivo</option>

                                {motivos.map((motivo) => (
                                    <option key={motivo.id} value={motivo.nombre}>
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
                            />
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => navigate('/student/materials')}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className={styles.submitButton}
                        >
                            Enviar denuncia
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
