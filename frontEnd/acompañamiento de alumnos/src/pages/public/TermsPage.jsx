import { useState } from 'react';
import {
  ArrowUp,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
  Scale,
  ShieldAlert,
  UserCheck,
  Users,
  ClipboardCheck,
  GraduationCap,
  Copyright,
  Settings,
} from 'lucide-react';

import PrivacySection from '../../components/privacy/PrivacySection';
import CollapsibleItem from '../../components/privacy/CollapsibleItem';

import styles from './TermsPage.module.css';

function TermsPage() {
  const [openFaq, setOpenFaq] = useState('faq-1');

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <ClipboardCheck size={16} />
          Términos y Condiciones
        </div>

        <h1>Términos y Condiciones de SIVA UNAHUR</h1>

        <p>
          Al usar la plataforma, aceptás estos términos. Este documento regula el
          acceso, uso, responsabilidades y condiciones aplicables a SIVA UNAHUR,
          una red social académica orientada a estudiantes universitarios de la Universidad Nacional de Hurlingham.
        </p>
      </section>

      <div className={styles.layout}>
        <div className={styles.content}>
          <PrivacySection
            id="aceptacion"
            title="Aceptación de los términos"
            icon={UserCheck}
          >
            <p>
              Al registrarte, iniciar sesión o utilizar SIVA UNAHUR, aceptás
              estos Términos y Condiciones. Si no estás de acuerdo con alguna de
              sus disposiciones, no deberías utilizar la plataforma.
            </p>

            <p>
              El uso continuo de la aplicación luego de una actualización de
              estos términos implica la aceptación de los cambios informados.
              La plataforma está destinada a estudiantes universitarios,
              administradores autorizados y miembros habilitados dentro del
              entorno académico correspondiente.
            </p>

            <p>
              Para utilizar SIVA UNAHUR, el usuario debe ser mayor de edad o
              contar con autorización institucional o académica suficiente para
              participar en la plataforma.
            </p>
          </PrivacySection>

          <PrivacySection
            id="servicio"
            title="Descripción del servicio"
            icon={GraduationCap}
          >
            <p>
              SIVA UNAHUR es una aplicación web universitaria que integra
              funcionalidades académicas y sociales para acompañar la trayectoria
              de estudiantes. La plataforma permite configurar perfiles,
              consultar situación académica, proyectar cursadas, organizar
              sesiones de estudio, compartir materiales y conectarse con otros
              estudiantes.
            </p>

            <p>
              El servicio está destinado a estudiantes y administradores. Los
              estudiantes pueden usar herramientas de seguimiento académico,
              feed, repositorio de materiales, sistema de contactos y
              notificaciones. Los administradores pueden gestionar parámetros,
              moderar contenido y realizar tareas de control dentro de la app.
            </p>

            <p>
              SIVA UNAHUR es una herramienta de apoyo académico. No reemplaza
              los canales oficiales de la universidad, sistemas administrativos,
              certificados, actas, inscripciones oficiales ni comunicaciones
              institucionales formales.
            </p>
          </PrivacySection>

          <PrivacySection
            id="registro"
            title="Registro y cuentas de usuario"
            icon={LockKeyhole}
          >
            <p>
              Para utilizar determinadas funcionalidades, el usuario debe crear
              una cuenta y proporcionar información verídica, actualizada y
              suficiente. El estudiante es responsable de mantener la
              confidencialidad de sus credenciales y de toda actividad realizada
              desde su cuenta.
            </p>

            <p>
              Los estudiantes pueden registrarse de forma autónoma según las
              reglas de acceso definidas por la plataforma. Los administradores
              son dados de alta por otros administradores autorizados o por el
              equipo responsable del sistema.
            </p>
          </PrivacySection>

          <PrivacySection
            id="uso-aceptable"
            title="Uso aceptable de la plataforma"
            icon={ShieldAlert}
          >
            <p>
              El usuario se compromete a utilizar SIVA UNAHUR con fines
              académicos, colaborativos y comunitarios. Está permitido compartir
              materiales educativos, organizar sesiones de estudio, conectarse
              con compañeros, participar en el feed y consultar herramientas de
              apoyo académico.
            </p>

            <p>
              Está prohibido publicar contenido ofensivo, discriminatorio,
              violento, amenazante, acosador, engañoso, fraudulento, spam,
              información falsa, datos personales de terceros sin autorización o
              material protegido por derechos de autor sin permiso.
            </p>

            <p>
              También está prohibido intentar vulnerar la seguridad del sistema,
              acceder a cuentas ajenas, manipular datos académicos, automatizar
              acciones abusivas o utilizar la plataforma para fines ajenos al
              entorno académico.
            </p>
          </PrivacySection>

          <PrivacySection
            id="contenido"
            title="Contenido generado por usuarios"
            icon={FileText}
          >
            <p>
              Cada usuario es responsable del contenido que publica, sube o
              comparte dentro de SIVA UNAHUR. Esto incluye posteos, archivos,
              enlaces, comentarios, sesiones de estudio, valoraciones,
              denuncias y cualquier otro dato ingresado en la plataforma.
            </p>

            <p>
              SIVA UNAHUR se reserva el derecho de remover, ocultar, suspender o
              moderar contenido que incumpla estos términos, afecte a otros
              usuarios, infrinja derechos de terceros o comprometa el correcto
              funcionamiento de la aplicación.
            </p>

            <p>
              El sistema de denuncias permite que los usuarios reporten
              materiales o conductas indebidas. Los administradores revisarán las
              denuncias y podrán tomar medidas de moderación. Los materiales que
              superen umbrales de denuncias definidos por la plataforma podrán
              ser suspendidos preventivamente.
            </p>
          </PrivacySection>

          <PrivacySection
            id="materiales"
            title="Repositorio de materiales"
            icon={BookOpen}
          >
            <p>
              El repositorio de materiales permite compartir archivos, enlaces y
              recursos relacionados con materias o trayectos académicos. Al subir
              un material, el usuario declara que cuenta con autorización para
              compartirlo o que el contenido es de su autoría.
            </p>

            <p>
              No se permite subir material protegido por derechos de autor sin
              permiso, documentos confidenciales,
              información personal de terceros o cualquier contenido que viole
              normas académicas o legales.
            </p>

            <p>
              La plataforma podrá establecer límites técnicos, como formatos
              permitidos y tamaño máximo de archivo.
              SIVA UNAHUR no se responsabiliza por la exactitud, vigencia o
              legalidad del contenido subido por terceros.
            </p>
          </PrivacySection>

          <PrivacySection
            id="sesiones"
            title="Sesiones de estudio colaborativo"
            icon={CalendarDays}
          >
            <p>
              Los usuarios pueden crear o sumarse a sesiones de estudio
              virtuales o presenciales. Quien crea una sesión es responsable de
              la información publicada, incluyendo nombre, materia, descripción,
              fecha, horario, enlace virtual, ubicación presencial y cupos.
            </p>

            <p>
              SIVA UNAHUR puede enviar recordatorios automáticos sobre sesiones,
              pero no garantiza que una sesión efectivamente se realice, que los
              participantes asistan o que el contenido tratado sea correcto.
            </p>

            <p>
              Las cancelaciones, modificaciones o cambios relevantes deberían
              realizarse desde la plataforma para mantener informados a los
              participantes.
            </p>
          </PrivacySection>

          <PrivacySection
            id="conexiones"
            title="Sistema de conexiones y red social"
            icon={Users}
          >
            <p>
              SIVA UNAHUR permite conectar estudiantes mediante contactos,
              invitaciones y vínculos académicos. Las invitaciones pueden
              enviarse por correo electrónico cuando un usuario utiliza esa
              funcionalidad.
            </p>

            <p>
              El usuario acepta recibir comunicaciones vinculadas con invitaciones
              de contacto, solicitudes, respuestas y actividad social relevante
              dentro de la plataforma.
            </p>

            <p>
              El feed de novedades puede mostrar actividad académica o social
              según la configuración de privacidad de cada perfil. El usuario
              puede controlar la visibilidad de cierta información desde su
              configuración.
            </p>
          </PrivacySection>

          <PrivacySection
            id="notificaciones"
            title="Notificaciones y comunicaciones"
            icon={Bell}
          >
            <p>
              La plataforma puede enviar emails transaccionales y notificaciones
              internas relacionadas con confirmaciones de cuenta, recuperación de
              acceso, recordatorios académicos, invitaciones de contacto,
              sesiones de estudio, alertas de denuncias, moderación y seguridad.
            </p>
          </PrivacySection>

          <PrivacySection
            id="administradores"
            title="Rol de los administradores"
            icon={Settings}
          >
            <p>
              Los administradores pueden gestionar carreras, planes de estudio,
              parámetros globales, usuarios administradores, estadísticas,
              denuncias, materiales reportados y demás configuraciones necesarias
              para el funcionamiento de SIVA UNAHUR.
            </p>

            <p>
              Las acciones administrativas deben realizarse dentro del marco de
              estos términos y con finalidad operativa, académica, técnica o de
              moderación. El acceso administrativo no habilita el uso indebido de
              información personal o académica de los usuarios.
            </p>
          </PrivacySection>

          <PrivacySection
            id="responsabilidad"
            title="Limitación de responsabilidad"
            icon={Scale}
          >
            <p>
              SIVA UNAHUR no garantiza que la información académica cargada por
              usuarios sea exacta, completa o actualizada. Las proyecciones,
              sugerencias y análisis generados por el asistente académico son
              orientativos y no constituyen asesoramiento oficial.
            </p>

            <p>
              Las decisiones académicas, inscripciones, cursadas, finales,
              equivalencias, correlatividades y trámites oficiales son
              responsabilidad del estudiante y deben verificarse por los canales
              institucionales correspondientes.
            </p>

            <p>
              La plataforma no será responsable por daños derivados del uso
              indebido del sistema, contenido publicado por terceros, errores en
              datos cargados por usuarios o decisiones tomadas exclusivamente en
              base a información orientativa.
            </p>
          </PrivacySection>

          <PrivacySection
            id="propiedad"
            title="Propiedad intelectual"
            icon={Copyright}
          >
            <p>
              La plataforma, su diseño, estructura, código, identidad visual,
              componentes y funcionalidades pertenecen a sus desarrolladores o a
              quienes correspondan según el marco del proyecto.
            </p>

            <p>
              El contenido subido por los usuarios continúa perteneciendo a sus
              respectivos titulares. Al subirlo a SIVA UNAHUR, el usuario otorga
              a la plataforma una licencia limitada, no exclusiva y necesaria
              para alojar, mostrar, organizar y compartir dicho contenido según
              la configuración de privacidad y las funcionalidades disponibles.
            </p>
          </PrivacySection>

          <PrivacySection
            id="modificaciones"
            title="Modificaciones al servicio y a los términos"
            icon={RefreshCw}
          >
            <p>
              SIVA UNAHUR puede modificar, suspender, mejorar o discontinuar
              funcionalidades de la plataforma por razones técnicas, académicas,
              operativas o de seguridad.
            </p>

            <p>
              Estos términos también pueden actualizarse. Cuando los cambios sean
              relevantes, se notificará a los usuarios mediante la aplicación,
              correo electrónico o aviso visible. El uso continuado de la
              plataforma luego de la publicación de cambios implica aceptación de
              la versión actualizada.
            </p>
          </PrivacySection>

          <PrivacySection
            id="contacto"
            title="Contacto"
            icon={Mail}
          >
            <p>
              Para consultas, reclamos, reportes o solicitudes vinculadas con
              estos términos, el usuario puede comunicarse con el equipo
              responsable de SIVA UNAHUR.
            </p>

            <p>
              Puede escribir a: <strong>contacto@siva-unahur.edu.ar</strong>.
              Si este correo cambia, se informará dentro de la aplicación.
            </p>
          </PrivacySection>

          <PrivacySection
            id="faq"
            title="Preguntas frecuentes sobre los términos"
            icon={HelpCircle}
          >
            <div className={styles.faqList}>
              <CollapsibleItem
                question="¿Puedo subir apuntes de mis profesores?"
                isOpen={openFaq === 'faq-1'}
                onToggle={() => setOpenFaq(openFaq === 'faq-1' ? '' : 'faq-1')}
                answer="Podés subir apuntes si tenés autorización para compartirlos o si son materiales propios. No deberías subir contenido protegido por derechos de autor, documentos internos o materiales que la universidad o docentes no hayan autorizado a distribuir."
              />

              <CollapsibleItem
                question="¿Qué pasa si denuncian un material que subí?"
                isOpen={openFaq === 'faq-2'}
                onToggle={() => setOpenFaq(openFaq === 'faq-2' ? '' : 'faq-2')}
                answer="El material puede ser revisado por administradores. Si se confirma que incumple las reglas, puede ser ocultado, suspendido o eliminado."
              />

              <CollapsibleItem
                question="¿La app reemplaza los sistemas oficiales de la universidad?"
                isOpen={openFaq === 'faq-3'}
                onToggle={() => setOpenFaq(openFaq === 'faq-3' ? '' : 'faq-3')}
                answer="No. SIVA UNAHUR es una herramienta de apoyo académico y social. Las decisiones oficiales sobre inscripción, materias, actas, finales, equivalencias o trámites deben verificarse en los canales institucionales correspondientes."
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

export default TermsPage;