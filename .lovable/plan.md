

## Plan: Banco de Pedidos (Order Log)

### Resumen
Cada vez que un cliente haga un pedido por WhatsApp, se guardará automáticamente un registro del pedido en la base de datos. El admin podrá ver todos los pedidos desde el panel de administración.

### Opción Google Sheets
Es posible conectar con Google Sheets usando un webhook (Zapier o similar), pero requiere configuración externa. La opción más directa y sin dependencias externas es guardar los pedidos en tu propia base de datos en la nube — que ya tienes activa.

### Cambios a realizar

**1. Crear tabla `orders` en la base de datos**
- `id` (uuid, auto-generado)
- `customer_name` (texto)
- `items` (JSON con nombre, cantidad, precio de cada producto)
- `total` (entero)
- `created_at` (timestamp)
- RLS: lectura pública, inserción pública

**2. Guardar pedido al hacer la orden (`CartDrawer.tsx`)**
- Antes de redirigir a WhatsApp, insertar el pedido en la tabla `orders`

**3. Vista de pedidos en el Admin (`Admin.tsx`)**
- Nueva pestaña/sección "Pedidos" en el panel admin
- Tabla con: fecha, nombre del cliente, items, total
- Ordenados del más reciente al más antiguo

### Archivos a modificar
- Nueva migración SQL (tabla `orders`)
- `src/components/CartDrawer.tsx` — insertar pedido en DB
- `src/pages/Admin.tsx` — sección para ver pedidos

