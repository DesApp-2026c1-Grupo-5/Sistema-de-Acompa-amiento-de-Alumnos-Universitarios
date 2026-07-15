import { useState } from 'react';
import {
  ArrowUp,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  Lock,
  Mail,
  RefreshCw,
  Scale,
  ShieldCheck,
  Users,
  UserRoundCog,
} from 'lucide-react';

import PrivacySection from '../../components/privacy/PrivacySection';
import CollapsibleItem from '../../components/privacy/CollapsibleItem';

import styles from './PrivacyPage.module.css';

function PrivacyPage() {
  const [openFaq, setOpenFaq] = useState('faq-1');

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Lock size={16} />
          Política de Privacidad
        </div>

        <h1>Política de Privacidad de SIVA UNAHUR</h1>

        <p>
          Tu privacidad es nuestra prioridad. Esta política explica cómo SIVA
          (Sistema Integrado de Vida Académica) UNAHUR recopila, utiliza,
          protege y permite controlar la información personal y académica dentro
          de la plataforma.
        </p>
      </section>

      <div className={styles.layout}>
        <div className={styles.content}>
          <PrivacySection id="datos" title="Qué datos recopilamos" icon={FileText}>
            <p>
              SIVA UNAHUR recopila únicamente los datos necesarios para brindar
              sus funcionalidades académicas, sociales y administrativas. Estos
              datos pueden incluir información de registro, como nombre, apellido,
              correo electrónico institucional o personal, carrera seleccionada,
              entre otros.
            </p>

            <p>
              También podemos almacenar información académica cargada por el
              estudiante de manera manual o importada desde archivos Excel,
              incluyendo materias aprobadas, regularizadas, pendientes, finales,
              avance de carrera, créditos, inscripciones y datos vinculados al
              seguimiento de trayectoria académica.
            </p>

            <ul>
              <li>Foto de perfil, nombre visible, carrera y configuración de privacidad.</li>
              <li>Actividad dentro de la app: inscripciones, aprobaciones, materiales subidos, valoraciones, denuncias y participación en sesiones.</li>
              <li>Visibilidad del perfil y publicaciones académicas en el feed.</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="uso" title="Cómo usamos tus datos" icon={UserRoundCog}>
            <p>
              Usamos tus datos para personalizar la experiencia académica dentro
              de SIVA UNAHUR. La información de carrera, materias aprobadas,
              regularizadas y pendientes permite que el asistente virtual académico
              analice tu situación actual, sugiera posibles cursadas y muestre
              proyecciones orientativas sobre tu trayectoria.
            </p>

            <p>
              La plataforma también utiliza tus datos para mostrar recordatorios,
              alimentar el feed social y académico cuando vos lo permitís desde
              la configuración de perfil, mejorar la organización de sesiones de
              estudio y facilitar el acceso a materiales vinculados con tus
              materias.
            </p>

            <ul>
              <li>Personalizar recomendaciones del asistente académico.</li>
              <li>Mostrar proyecciones de cursada y avance académico.</li>
              <li>Publicar eventos académicos en el feed solo si tu configuración lo permite.</li>
              <li>Enviar notificaciones, invitaciones, confirmaciones y recordatorios por email o dentro de la app.</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="compartidos" title="Datos que compartís con otros usuarios" icon={Users}>
            <p>
              SIVA UNAHUR permite configurar el perfil como público o privado.
              Si tu perfil es público, otros estudiantes pueden ver información
              básica como tu nombre visible, foto de perfil, carrera y datos que
              hayas decidido mostrar. Si tu perfil es privado, la visibilidad se
              limita a tus contactos o a la información mínima necesaria para
              interactuar dentro de la plataforma.
            </p>

            <p>
              Los contactos pueden ver más información académica o social cuando
              vos habilitás esa visibilidad.
            </p>

            <p>
              Algunos eventos académicos, como inscripciones, materias aprobadas
              o materiales compartidos, pueden aparecer en el feed.
            </p>
          </PrivacySection>

          <PrivacySection id="materiales" title="Repositorio de materiales" icon={BookOpen}>
            <p>
              Los archivos, enlaces, descripciones, materias asociadas y
              valoraciones que subís al repositorio de materiales pueden ser
              visibles para otros usuarios según la configuración general de la
              plataforma y la visibilidad de tu perfil. Antes de subir contenido,
              debés asegurarte de contar con autorización para compartirlo y de
              que no incluya datos personales innecesarios de terceros.
            </p>

            <p>
              Las denuncias realizadas sobre materiales se tratan de forma
              reservada. El resto de los estudiantes no puede ver quién realizó
              una denuncia. Los administradores autorizados pueden revisar la
              información necesaria para moderar el contenido, analizar
              incumplimientos y tomar medidas dentro de la plataforma.
            </p>
          </PrivacySection>

          <PrivacySection id="sesiones" title="Sesiones de estudio" icon={CalendarDays}>
            <p>
              Cuando creás o te unís a una sesión de estudio, SIVA UNAHUR puede
              almacenar el nombre de la sesión, materia asociada, descripción,
              fecha, horario, modalidad, enlace virtual o ubicación presencial,
              cupos disponibles y lista de participantes.
            </p>

            <p>
              La visibilidad de estos datos depende del tipo de sesión y de las
              reglas de participación. Las sesiones públicas pueden ser vistas por
              estudiantes interesados en la materia. Las sesiones restringidas o
              compartidas entre contactos solo estarán disponibles para los
              usuarios habilitados.
            </p>
          </PrivacySection>

          <PrivacySection id="notificaciones" title="Correo electrónico y notificaciones" icon={Bell}>
            <p>
              Tu correo electrónico se utiliza para comunicaciones vinculadas con
              el funcionamiento de SIVA UNAHUR, como confirmaciones de cuenta,
              recuperación de acceso, recordatorios académicos, invitaciones de
              contacto, avisos sobre sesiones de estudio, alertas de denuncias y
              novedades relevantes de la plataforma.
            </p>

            <p>
              Las notificaciones estrictamente necesarias para seguridad,
              moderación o funcionamiento de la cuenta pueden mantenerse activas.
              Las notificaciones opcionales, como recordatorios académicos,
              novedades sociales o avisos promocionales internos, pueden
              desactivarse desde la configuración de notificaciones.
            </p>
          </PrivacySection>

          <PrivacySection id="seguridad" title="Seguridad de los datos" icon={ShieldCheck}>
            <p>
              SIVA UNAHUR aplica medidas técnicas y organizativas razonables para
              proteger la información personal y académica contra accesos no
              autorizados, pérdida, o uso incompatible con los fines de la
              plataforma.
            </p>

            <p>
              El acceso administrativo está restringido a usuarios autorizados y
              se limita a tareas de soporte, moderación, revisión de denuncias,
              mantenimiento de la plataforma y cumplimiento de reglas internas.
              Los administradores no deben utilizar la información académica o
              personal para fines ajenos al servicio.
            </p>
          </PrivacySection>

          <PrivacySection id="derechos" title="Tus derechos" icon={Scale}>
            <p>
              Como usuario de SIVA UNAHUR, podés solicitar el acceso a tus datos,
              pedir la corrección de información incorrecta, actualizar tu perfil,
              modificar la visibilidad de tus datos académicos o solicitar la
              eliminación de información que ya no sea necesaria para el uso de
              la plataforma.
            </p>
          </PrivacySection>

          <PrivacySection id="contacto" title="Contacto" icon={Mail}>
            <p>
              Para consultas vinculadas con privacidad, uso de datos personales,
              visibilidad del perfil, eliminación de cuenta o revisión de
              información académica, podés comunicarte con el equipo responsable
              de SIVA UNAHUR.
            </p>

            <p>
              Podés escribir a: <strong>privacidad@siva-unahur.edu.ar</strong>.
              Si este correo cambia, se informará dentro de la aplicación o en
              una actualización de esta política.
            </p>
          </PrivacySection>

          <PrivacySection id="cambios" title="Cambios en esta política" icon={RefreshCw}>
            <p>
              SIVA UNAHUR puede actualizar esta Política de Privacidad para
              reflejar cambios funcionales, técnicos, legales o institucionales.
            </p>
          </PrivacySection>

          <PrivacySection id="faq" title="Preguntas frecuentes sobre privacidad" icon={HelpCircle}>
            <div className={styles.faqList}>
              <CollapsibleItem
                question="¿Otros estudiantes pueden ver mi situación académica completa?"
                isOpen={openFaq === 'faq-1'}
                onToggle={() => setOpenFaq(openFaq === 'faq-1' ? '' : 'faq-1')}
                answer="No necesariamente. La visibilidad depende de tu configuración de perfil. Podés limitar la información académica visible y decidir qué datos compartir con contactos o con la comunidad."
              />

              <CollapsibleItem
                question="¿Las denuncias que hago son públicas?"
                isOpen={openFaq === 'faq-2'}
                onToggle={() => setOpenFaq(openFaq === 'faq-2' ? '' : 'faq-2')}
                answer="No. Las denuncias no son visibles para otros estudiantes. Solo pueden ser revisadas por administradores autorizados para tareas de moderación."
              />

              <CollapsibleItem
                question="¿El asistente académico comparte mis datos?"
                isOpen={openFaq === 'faq-5'}
                onToggle={() => setOpenFaq(openFaq === 'faq-5' ? '' : 'faq-5')}
                answer="No publica tus datos por sí mismo. Usa tu información académica para generar análisis y proyecciones dentro de tu cuenta. Cualquier visibilidad externa depende de tu configuración de privacidad."
              />
            </div>
          </PrivacySection>
        </div>
      </div>

      <button
        type="button"
        className={styles.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Volver arriba"
      >
        <ArrowUp size={20} />
      </button>
    </main>
  );
}

export default PrivacyPage;