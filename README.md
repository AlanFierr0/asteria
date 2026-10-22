# Asteria Online

Trabajo práctico final interactivo de Sistemas Distribuidos.

Sitio publicado: https://asteria.alanfierro.dev

## Uso

Abrir `index.html` en un navegador. El documento incluye estilos, scripts y el PDF del enunciado; no requiere instalación ni dependencias.

La navegación principal tiene cuatro accesos: Enunciado, Casos, Arquitectura y Datacenters.

Dentro de Casos, un índice lateral en escritorio y un selector compacto en móvil permiten elegir el caso. Las pestañas Caso completo, Problema, Falla, Garantía, Solución y Trade-off conservan esa elección. Caso completo muestra Problema, Fallas, Garantías, todas las Soluciones (incluidas S1/S2) y sus Trade-offs en el orden del documento, sin repetir las garantías en cada variante. Solución incluye el desarrollo y el diagrama de interacción; Trade-off explica capacidades, límites, garantías y costos. Los enlaces anteriores a Procesos y fallas abren Solución.

En Datacenters, los controles y la explicación del escenario preceden al gráfico. La tabla Ubicación del estado se puede desplegar cuando se necesita.

Las secciones y selecciones se pueden compartir mediante su URL, incluso al abrir enlaces en otra pestaña. Atrás recupera el caso anterior y cambiar de caso vuelve al comienzo de la lectura. El diseño se adapta a pantallas pequeñas y a la preferencia de apariencia del sistema.

## Verificación

`node scripts/check.mjs` comprueba la sintaxis, los identificadores, el contenido y el estado de las URL. La revisión visual y la vista Casos están documentadas en [docs/visual-review-2026-10-22.md](docs/visual-review-2026-10-22.md). La auditoría anterior se conserva en [docs/ux-review.md](docs/ux-review.md).

## Integrantes

Agustín Martínez, Alan Fierro, Nicolás Mangini y Tomás Alcázar.

## Fuente de contenido

Actualizado el 22 de octubre de 2026 según la pestaña [Correcciones](https://docs.google.com/document/d/1XIylurv8bG78HzDHQjRj1hQXe2DOTDpEpgs7KUcjLSY/edit?tab=t.15qzevb2akzo). Los resúmenes, respuestas ante fallas, diagramas, módulos, distribución de datos y trade-offs reflejan esa revisión.
