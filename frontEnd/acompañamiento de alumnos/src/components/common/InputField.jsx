import styles from './InputField.module.css';

function InputField({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  error,
  required = false,
  onChange,
}) {
  return (
    <label className={styles.field}>
      {label && (
        <span className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
      )}

      <input
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />

      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

export default InputField;

/*
Ejemplo de uso:

<InputField
  label="Email"
  name="email"
  type="email"
  placeholder="tu@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>
*/