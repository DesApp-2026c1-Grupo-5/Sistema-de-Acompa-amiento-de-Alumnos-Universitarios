import { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import Button from '../../components/common/Button';
import ModalConfirmation from '../../components/common/ModalConfirmation';
import styles from './Admins.module.css';

function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    role: 'admin'
  });

  useEffect(() => {
    fetch('/data/admins.json')
      .then((res) => res.json())
      .then((data) => {
        setAdmins(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admins:', err);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = () => {
    const newAdmin = {
      id: Date.now(),
      name: formData.name,
      lastname: formData.lastname,
      email: formData.email,
      role: formData.role,
      createdAt: new Date().toISOString().split('T')[0]
    };

    console.log('POST /api/admins', newAdmin);

    setAdmins((prev) => [newAdmin, ...prev]);

    setFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: 'admin'
    });

    setShowConfirmModal(false);
  };

  const handleCancelCreate = () => {
    setShowConfirmModal(false);
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      setAdmins((prev) => prev.filter((admin) => admin.id !== adminToDelete.id));
      console.log('DELETE /api/admins', adminToDelete.id);
    }
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: 'admin'
    });
  };

  const getRoleBadgeClass = (role) => {
    return role === 'super_admin' ? styles.badgeSuperAdmin : styles.badgeAdmin;
  };

  const getRoleLabel = (role) => {
    return role === 'super_admin' ? 'Super Admin' : 'Administrador';
  };

  

  return (
    <div className={styles.container}>
      <PageTitle
        title="Gestionar Administradores"
        description="Crear y administrar cuentas del sistema"
      />

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.formIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <div>
              <h2 className={styles.formTitle}>Nuevo administrador</h2>
              <p className={styles.formSubtitle}>Complete los datos requeridos</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.formFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Nombre <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Ej: Federico"
                className={styles.input}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Apellido <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="lastname"
                placeholder="Ej: García"
                className={styles.input}
                value={formData.lastname}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="ejemplo@edupath.com"
                className={styles.input}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Contraseña <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Rol</label>
              <select
                name="role"
                className={styles.input}
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="admin">Administrador</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className={styles.formActions}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!formData.name || !formData.lastname || !formData.email || !formData.password}
                iconRight={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>}
              >
                Crear Administrador
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Administradores existentes</h2>
            <p className={styles.tableSubtitle}>Listado de cuentas administrativas del sistema</p>
          </div>

          {loading ? (
            <div className={styles.emptyState}>Cargando...</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Fecha creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className={styles.nameCell}>
                        {admin.name} {admin.lastname}
                      </td>
                      <td className={styles.emailCell}>{admin.email}</td>
                      <td>
                        <span className={`${styles.badge} ${getRoleBadgeClass(admin.role)}`}>
                          {getRoleLabel(admin.role)}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{admin.createdAt}</td>
                      <td>
                        <Button
                          variant="iconSquareDanger"
                          title="Eliminar"
                          iconLeft={<Trash2 size={16} />}
                          onClick={() => handleDeleteClick(admin)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
</div>
      </div>

      <ModalConfirmation
        open={showConfirmModal}
        title="Crear administrador"
        message={`¿Está seguro que desea crear al administrador ${formData.name} ${formData.lastname}?`}
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelCreate}
        variant="primary"
      />

      <ModalConfirmation
        open={showDeleteModal}
        title="Eliminar administrador"
        message={`¿Está seguro que desea eliminar al administrador ${adminToDelete?.name} ${adminToDelete?.lastname}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </div>
  );
}

export default Admins;