import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './ReportMaterial.module.css';

export default function ReportMaterial() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [material, setMaterial] = useState(null);
    const [motivos, setMotivos] = useState([]);

    const [formData, setFormData] = useState({
        motivo: '',
        detalle: '',
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const materialResponse = await fetch('/data/materials.json');
                const motivosResponse = await fetch('/data/reportReasons.json');

                const materiales = await materialResponse.json();
                const motivosData = await motivosResponse.json();

                const materialEncontrado = materiales.find(
                    (item) => String(item.id) === id
                );

                setMaterial(materialEncontrado);
                setMotivos(motivosData);
            } catch (error) {
                console.error(error);
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

    if (!material) {
        return (
            <div className={styles.loading}>
                Cargando información del material...
            </div>
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