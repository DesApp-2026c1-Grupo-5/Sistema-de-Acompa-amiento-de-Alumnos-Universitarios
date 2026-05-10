/**
 * Muestra finales pendientes y vencimientos.
 */

import Card from "../common/Card";
import styles from "./PendingFinals.module.css";

export default function PendingFinals({ finales }) {
  return (
    <Card>
      <div className={styles.container}>
        <h2>Finales pendientes</h2>

        {finales.map((final) => (
          <div key={final.id} className={styles.item}>
            <div>
              <h3>{final.materia}</h3>
              <p>Intentos previos: {final.intentos}</p>
            </div>

            <span>
              Regularidad vence: {final.vencimiento}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}