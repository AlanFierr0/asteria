# Asteria Online

Trabajo práctico final interactivo de Sistemas Distribuidos.

Sitio publicado: https://asteria.alanfierro.dev

## Uso

Abrir `index.html` en un navegador. El documento incluye estilos, scripts y el PDF del enunciado; no requiere instalación ni dependencias.

La navegación principal tiene seis accesos: Presentación, Enunciado, Casos, Arquitectura, Datacenters y Bibliografía. La presentación del caso 6 se puede recorrer desde el sitio o abrir en otra pestaña; para funcionar localmente necesita conservar la carpeta `presentacion` junto a `index.html`. Bibliografía reúne el enunciado en PDF y los documentos de referencia del equipo en Google Docs.

Dentro de Casos, un índice lateral en escritorio y un selector compacto en móvil permiten elegir el caso. Las pestañas Caso completo, Problema, Falla, Garantía, Solución y Trade-off conservan esa elección. Caso completo muestra Problema, Fallas, Garantías, todas las Soluciones (incluidas S1/S2) y sus Trade-offs en el orden del documento, sin repetir las garantías en cada variante. Solución incluye el desarrollo y el diagrama de interacción; Trade-off explica capacidades, límites, garantías y costos. Los enlaces anteriores a Procesos y fallas abren Solución.

El desarrollo de cada solución incluye los contratos propuestos entre componentes, operaciones, datos, respuestas y recuperación ante fallas. Los nombres de operaciones describen el diseño y no corresponden a una implementación ejecutable.

En Datacenters, los controles y la explicación del escenario preceden al gráfico. La tabla Ubicación del estado se puede desplegar cuando se necesita.

Las secciones y selecciones se pueden compartir mediante su URL, incluso al abrir enlaces en otra pestaña. Atrás recupera el caso anterior y cambiar de caso vuelve al comienzo de la lectura. El diseño se adapta a pantallas pequeñas y a la preferencia de apariencia del sistema.

## Lectura académica

La ficha del Enunciado identifica a Universidad Austral, la materia y los integrantes, sin comisión ni fecha. La navegación utiliza las pestañas del caso y los botones, sin un segundo índice ni enlaces repetidos debajo de las fallas.

Los enlaces con `section` conservan el destino al recargar o volver atrás. Saturación incluye una comparación desplegable de S1/S2 sobre admisión, caída de un nodo, partición y costos. Los rótulos Requisito, Propuesta y Límites y costos distinguen el enunciado de las decisiones de diseño. El glosario contextual explica únicamente los términos que aparecen en las soluciones del caso.

Solución y Datacenters permiten ampliar el diagrama. En pantallas chicas la vista ampliada se desplaza para mantener los rótulos legibles. Los procesos conservan su selector de pasos y su explicación dentro de la ampliación. Cerrar o pulsar Escape restaura el gráfico y sus controles en su posición original.

## Verificación

`node scripts/check.mjs` comprueba la sintaxis, los identificadores, el contenido y el estado de las URL. La revisión visual y la vista Casos están documentadas en [docs/visual-review-2026-10-22.md](docs/visual-review-2026-10-22.md). La auditoría anterior se conserva en [docs/ux-review.md](docs/ux-review.md).

## Integrantes

Agustín Martínez, Alan Fierro, Nicolás Mangini y Tomás Alcázar.

## Fuente de contenido

Actualizado el 4 de noviembre de 2026 según la pestaña [Entrega Final](https://docs.google.com/document/d/1XIylurv8bG78HzDHQjRj1hQXe2DOTDpEpgs7KUcjLSY/edit?tab=t.15qzevb2akzo). Los resúmenes, respuestas ante fallas, diagramas, módulos, distribución de datos y trade-offs reflejan esa revisión.

El documento es la fuente de verdad para problemas, fallas, garantías y soluciones. Se conservan como ampliaciones los contratos gRPC, las validaciones propuestas y los trade-offs de la web. El ingreso utiliza pasos recuperables con compensación; la acreditación de oro se habilita con la autorización del pago, según el documento.
