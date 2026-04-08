

## Plan: Exportar Pedidos a Excel con Pestañas por Día

### Resumen
Agregar un botón "Exportar Excel" en la sección Pedidos del admin. El archivo descargado tendrá **una pestaña (sheet) por cada día** con pedidos, mostrando los detalles de cada orden.

### Cambios a realizar

**1. Instalar dependencia `xlsx`**
- Librería ligera para generar archivos `.xlsx` con múltiples hojas desde el navegador

**2. Botón de exportación en Admin (`src/pages/Admin.tsx`)**
- Agregar botón "Exportar Excel" en la sección Pedidos
- Al hacer clic:
  1. Agrupar los pedidos por fecha (día)
  2. Crear una hoja por cada día (nombre de pestaña = fecha, ej: "2026-04-08")
  3. Cada hoja contiene columnas: Hora, Cliente, Items, Total
  4. Descargar automáticamente el archivo `.xlsx`

### Detalles técnicos
- Se usa la librería `xlsx` (SheetJS) que funciona 100% en el navegador sin backend
- Los items JSON se aplanarán a texto legible (ej: "2x Pastelito, 1x Jugo")
- El archivo se puede abrir directamente en Google Sheets o Excel
- No requiere cambios en la base de datos

### Archivo a modificar
- `src/pages/Admin.tsx` — agregar botón y lógica de exportación
- `package.json` — agregar dependencia `xlsx`

