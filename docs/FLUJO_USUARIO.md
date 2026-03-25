# FLUJO DE USUARIO

Especificaciones del flujo de navegación y acciones del usuario.

## 1. Actores
- **Usuario Autenticado:** Persona que ha iniciado sesión con Google y tiene acceso a sus datos financieros.

## 2. Navegación Global
- **Sidebar:** Permite navegar entre Dashboard, Transacciones, Cuentas, Categorías y Ajustes.
- **Botón de Acción Rápida:** Botón flotante "+" disponible en la mayoría de las vistas para crear transacciones rápidamente.

## 3. Flujos Principales

### A. Registro de una Transferencia Unificada
1. El usuario hace clic en el botón "+".
2. Selecciona la opción "Transferencia".
3. El modal muestra campos para:
   - Cuenta de Origen.
   - Cuenta de Destino.
   - Monto.
   - Fecha.
   - Descripción/Nota.
4. Si el usuario intenta cerrar sin guardar habiendo escrito datos, aparece un modal de confirmación.
5. El usuario hace clic en "Guardar".
6. El sistema crea dos documentos vinculados en Firestore.
7. La vista de Transacciones muestra un registro consolidado (filtrando el ingreso duplicado).

### B. Consulta de Movimientos desde Dashboard
1. El usuario visualiza sus cuentas en el Dashboard.
2. Hace clic en una tarjeta de cuenta (ej: "Banco").
3. El sistema abre un modal con la lista de transacciones filtrada automáticamente para esa cuenta.

### C. Eliminación Segura de Cuentas
1. El usuario accede a "Cuentas".
2. Intenta eliminar una cuenta con el icono de papelera.
3. Si la cuenta tiene transacciones, el sistema bloquea la acción informando el motivo.
4. Si está vacía, solicita confirmación antes de proceder.

## 4. Estados de la Interfaz
- **Cargando:** Skeleton screens mientras se recuperan datos de Firestore.
- **Vacío:** Ilustración y mensaje cuando no hay transacciones que coincidan con los filtros.
- **Error:** Notificación visual si falla la conexión o los permisos de Firestore.
