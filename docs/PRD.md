# PRD - Finanzas App

## 1. Descripción del Producto
Aplicación web para la gestión de finanzas personales, permitiendo el seguimiento de ingresos, gastos y transferencias entre cuentas de forma centralizada.

## 2. Planteamiento del Problema
Los usuarios suelen tener múltiples cuentas (efectivo, bancos, billeteras virtuales) y pierden el rastro de sus movimientos. Las transferencias entre cuentas propias a menudo se registran como dos movimientos independientes, lo que dificulta la lectura de la lista de transacciones.

## 3. Objetivos del Producto
- Centralizar la información financiera del usuario.
- Simplificar el registro de movimientos diarios.
- Unificar la visualización de transferencias internas.
- Proporcionar visibilidad clara de saldos y flujos de caja mensuales.

## 4. Usuarios Objetivo
Personas que buscan un control detallado de sus finanzas personales y que manejan múltiples cuentas bancarias o billeteras virtuales.

## 5. Alcance
- Registro de cuentas, categorías y transacciones.
- Dashboard resumen con tarjetas de cuenta interactivas.
- Filtros avanzados y búsqueda en tiempo real.
- Unificación de transferencias en la vista de transacciones.
- Sistema de seguridad mediante confirmaciones antes de acciones destructivas o descartar cambios.

## 6. Módulos Funcionales
- **Autenticación:** Google Login.
- **Cuentas:** CRUD de cuentas financieras con validación de integridad (no eliminar si hay transacciones).
- **Categorías:** CRUD de categorías de ingresos/gastos.
- **Transacciones:** Registro y visualización de movimientos con soporte para transferencias vinculadas.
- **Transferencias:** Lógica de vinculación automática entre cuentas de origen y destino.
- **Seguridad UX:** Modales de confirmación para cierre de formularios con cambios y eliminaciones.

## 7. Flujos de Usuario
- Login -> Dashboard -> Ver saldos -> Click en cuenta -> Ver transacciones de esa cuenta.
- Nueva Transacción -> Seleccionar tipo -> Completar datos -> Intentar cerrar -> Confirmar descarte o Guardar.
- Ver Transacciones -> Aplicar filtros -> Consultar detalles unificados de transferencias.

## 8. Reglas de Negocio
- Una transferencia debe afectar el saldo de dos cuentas (origen y destino) mediante registros vinculados.
- Los gastos restan saldo, los ingresos suman saldo.
- Las transferencias no afectan el balance total del usuario, solo el de las cuentas individuales.
- No se permite eliminar una cuenta si tiene transacciones registradas.

## 9. Modelo de Datos
Ver `firebase-blueprint.json` para detalles técnicos.

## 10. Requisitos de la API
- Firebase Firestore para persistencia.
- Firebase Auth para seguridad.

## 11. Requisitos No Funcionales
- Diseño responsivo (Mobile-First).
- Animaciones fluidas (Framer Motion).
- Tiempo de respuesta real-time (Firestore Snapshots).

## 12. Requisitos de UX
- Interfaz limpia y minimalista.
- Feedback visual claro al registrar movimientos.
- Navegación intuitiva mediante Sidebar.

## 13. Casos Extremos
- Eliminación de una cuenta con transacciones vinculadas.
- Edición de una transferencia (cambio de monto o cuentas).
- Sincronización de datos en múltiples dispositivos.

## 14. Métricas
- Número de transacciones registradas por usuario.
- Frecuencia de uso de la funcionalidad de transferencia.
- Tiempo promedio de registro de un movimiento.

## 15. Seguridad y Cumplimiento
- Reglas de seguridad de Firestore para proteger datos por `uid`.
- Autenticación segura mediante Google.

## 16. Arquitectura Técnica
Ver `ARQUITECTURA.md`.

## 17. Hoja de Ruta
Ver `ROADMAP.md`.
