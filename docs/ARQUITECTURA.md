# ARQUITECTURA del Proyecto

## Enfoque Arquitectónico
- **Frontend:** Next.js 15+ (App Router) con componentes de React (Server y Client Components).
- **Base de Datos:** Firebase Firestore (NoSQL) para almacenamiento de datos en tiempo real.
- **Autenticación:** Firebase Auth (Google Login) para gestión de usuarios.
- **Estilo:** Tailwind CSS para diseño responsivo y moderno.
- **Tipografía:**
  - **Inter (Sans-serif):** Utilizada para la interfaz de usuario general, menús, etiquetas y descripciones. Proporciona una apariencia limpia y profesional.
  - **JetBrains Mono (Monospace):** Utilizada exclusivamente para datos numéricos (saldos, montos, porcentajes, fechas e inputs de números). Mejora la legibilidad de las cifras y facilita la comparación visual de valores.
- **Animaciones:** Framer Motion (`motion/react`) para transiciones suaves y feedback visual.

## Modelo de Datos (Firestore)
- **`accounts`**: Información de cuentas (id, name, type, initialBalance, createdAt).
- **`categories`**: Categorías de ingresos/gastos (id, name, type).
- **`transactions`**: Movimientos financieros (id, type, description, amount, accountId, categoryId, issueDate, dueDate, completed, note, linkedTransactionId).

## Decisiones Técnicas: Unificación de Transferencias

### Problema Actual
Las transferencias generan dos documentos en Firestore:
1.  **Egreso (Cuenta Origen):** `amount < 0`, `type: 'transfer'`.
2.  **Ingreso (Cuenta Destino):** `amount > 0`, `type: 'transfer'`.
Ambos están vinculados por el campo `linkedTransactionId`. Actualmente, la vista de transacciones los muestra como dos filas separadas.

### Plan de Unificación (Lógica de Frontend)

1.  **Agrupación en el Filtrado:**
    -   En `TransactionsView.tsx`, al procesar el array `transactions`, se debe implementar un mecanismo de agrupación.
    -   Si una transacción tiene `type === 'transfer'` y un `linkedTransactionId`, se busca su par.
    -   Se genera un objeto "Virtual Transfer" que consolida la información de ambas (Cuenta Origen, Cuenta Destino, Monto absoluto).
    -   Se muestra solo una fila por cada par de transacciones vinculadas.

2.  **Interfaz de Usuario (UI):**
    -   La fila de transacción detectará si es una transferencia unificada.
    -   **Descripción:** "Transferencia entre cuentas".
    -   **Detalle:** "De [Nombre Cuenta Origen] a [Nombre Cuenta Destino]".
    -   **Monto:** Se muestra el monto absoluto (sin signo +/-) con un icono de transferencia (`ArrowRightLeft`).

3.  **Gestión de Acciones (CRUD):**
    -   **Eliminación:** Al eliminar una transferencia unificada, el sistema debe ejecutar la eliminación de ambos documentos en Firestore.
    -   **Edición:** El modal de edición debe cargar los datos de ambas transacciones y permitir modificar el monto, la fecha o las cuentas involucradas, actualizando ambos registros.

### Beneficios
-   Mejora la legibilidad de la lista de transacciones.
-   Evita la confusión del usuario al ver dos movimientos por una sola acción de transferencia.
-   Mantiene la integridad de los saldos de las cuentas individuales en Firestore.
