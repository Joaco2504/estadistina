\---

name: browser-qa-debugger

description: Regla de verificación obligatoria con control de navegador, detección de bugs en consola y auto-reparación antes de finalizar.

\---



\# Flujo de Verificación y Control de Navegador



Antes de marcar cualquier tarea o componente como completado, el agente DEBE ejecutar este ciclo de validación autónomo:



1\. \*\*Compilación y Servidor Local:\*\*

&#x20;  - Ejecutar el servidor de desarrollo (`npm run dev`) o build de pruebas (`npm run build`).

&#x20;  - Verificar que no existan errores de TypeScript ni advertencias de compilación.



2\. \*\*Control de Navegador y Pruebas E2E (Playwright):\*\*

&#x20;  - Abrir las rutas modificadas en una sesión de navegador headless/headed.

&#x20;  - Probar la interacción real del usuario:

&#x20;    \* Inserción manual de datos con `;`.

&#x20;    \* Presionado del botón "Generar Datos Aleatorios".

&#x20;    \* Cálculo con campos R, k, A llenos y vacíos.

&#x20;    \* Renderizado visual correcto del gráfico (sin solapamiento de etiquetas).



3\. \*\*Inspección de Consola y Red:\*\*

&#x20;  - Capturar logs de la consola del navegador (`console.error`, advertencias de hidratación de React/Next.js, errores de renderizado de KaTeX o Recharts).

&#x20;  - Comprobar que no haya peticiones HTTP fallidas (404, 500).



4\. \*\*Bucle de Auto-Reparación (Self-Healing Loop):\*\*

&#x20;  - Si se detecta CUALQUIER error en la consola o falla visual:

&#x20;    1. Analizar el stack trace del error.

&#x20;    2. Modificar el código fuente para resolver el bug.

&#x20;    3. Volver a ejecutar la prueba en el navegador.

&#x20;  - Solo dar la tarea por finalizada cuando el navegador cargue de forma 100% limpia y sin errores.

