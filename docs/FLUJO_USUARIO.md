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
4. El usuario hace clic en "Guardar".
5. El sistema crea dos documentos vinculados en Firestore.
6. La vista de Transacciones muestra un único registro consolidado.

### B. Consulta de Movimientos
1. El usuario accede a la sección "Transacciones".
2. Visualiza la lista de movimientos ordenados por fecha descendente.
3. Las transferencias se distinguen por un icono de doble flecha y la leyenda "De [Origen] a [Destino]".
4. El usuario puede filtrar por cuenta para ver solo los movimientos que afectan a una billetera específica.

### C. Edición de una Transferencia
1. El usuario hace clic en los tres puntos de una transferencia en la lista.
2. Selecciona "Editar".
3. El modal carga los datos de ambos registros vinculados.
4. El usuario modifica el monto y guarda.
5. El sistema actualiza ambos documentos en Firestore para mantener la coherencia.

## 4. Estados de la Interfaz
- **Cargando:** Skeleton screens mientras se recuperan datos de Firestore.
- **Vacío:** Ilustración y mensaje cuando no hay transacciones que coincidan con los filtros.
- **Error:** Notificación visual si falla la conexión o los permisos de Firestore.
