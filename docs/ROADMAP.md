# ROADMAP del Proyecto

## Estado Actual
- Gestión básica de cuentas, categorías y transacciones.
- Implementación de transferencias entre cuentas (generando dos movimientos separados).
- Dashboard con resumen mensual y saldos.
- Filtros de búsqueda y fecha.

## Fases Completadas
- [x] Estructura inicial del proyecto (Next.js + Firebase).
- [x] Autenticación con Google.
- [x] CRUD de Cuentas y Categorías.
- [x] Registro de Ingresos, Gastos y Transferencias.
- [x] Vista de Transacciones con filtros.

## Fases Futuras (Planificación)

### Fase 1: Unificación de Transferencias en la Vista (Prioridad Alta)
- [ ] Modificar la lógica de filtrado en `TransactionsView.tsx` para agrupar transacciones vinculadas (`linkedTransactionId`).
- [ ] Mostrar las transferencias como un único movimiento en la lista: "De [Cuenta Origen] a [Cuenta Destino]".
- [ ] Asegurar que las acciones de edición y eliminación afecten a ambos registros vinculados.

### Fase 2: Mejoras de UX y Visualización
- [ ] Implementar gráficos de torta/barras para gastos por categoría.
- [ ] Agregar soporte para transacciones recurrentes.
- [ ] Implementar notificaciones de vencimiento de deudas/pagos (dueDate).

### Fase 3: Funcionalidades Avanzadas
- [ ] Exportación de reportes en PDF/CSV.
- [ ] Soporte multi-moneda con conversión automática.
- [ ] Integración con APIs bancarias (opcional).
- [ ] Portal de presupuestos mensuales por categoría.
