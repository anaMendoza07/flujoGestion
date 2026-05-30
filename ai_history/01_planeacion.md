
01 — Análisis del problema, planeación y desarrollo de prompts

Herramienta: ChatGPT

Fase de análisis y planificación de la solución, incluyendo la evaluación de los requerimientos de la prueba técnica, definición de la arquitectura inicial, configuración del entorno de desarrollo y preparación de instrucciones para apoyar la implementación.

Link a la conversación completa:
https://chatgpt.com/share/6a177c72-7cdc-83e9-80fe-aa268a568b9a7

# Agentemotor Technical Challenge

## Objetivo

Construir una aplicación web para reemplazar el Excel utilizado por María para gestionar renovaciones de pólizas y seguimiento de clientes.

La aplicación debe enfocarse en:

* Gestión de clientes
* Gestión de pólizas
* Seguimiento comercial
* Renovaciones
* Priorización operacional
* Visualización de riesgo

---

# Problema de Negocio

Actualmente María administra pólizas mediante Excel.

Problemas detectados:

* Pérdida de clientes por falta de seguimiento
* Poca visibilidad de pólizas críticas
* Falta de contexto histórico
* Priorización manual
* Riesgo de olvidar renovaciones

---

# Regla de Negocio Principal

Existe una ventana crítica de recuperación de 30 días después del vencimiento de una póliza.

Estados definidos:

* ACTIVE
* EXPIRING_SOON
* OVERDUE
* LOST
* RENEWED

Lógica:

* expiration_date > today → ACTIVE
* 0-7 días restantes → EXPIRING_SOON
* vencida entre 1-30 días → OVERDUE
* vencida más de 30 días → LOST

---

# MVP Definido

## Incluye

### Clientes

* Crear cliente
* Editar cliente
* Eliminar cliente
* Consultar clientes

### Pólizas

* Crear póliza
* Editar póliza
* Renovar póliza
* Filtrar pólizas
* Visualizar riesgo

### Seguimiento

* Notas
* Historial de contacto
* Registro de seguimiento

### Dashboard

* KPIs
* Tabla operacional
* Badges de estado
* Priorización visual

### WhatsApp

* Botón directo mediante wa.me

---

# Funcionalidades Descartadas

* Multiempresa
* Autenticación avanzada
* Roles
* Docker obligatorio
* Microservicios
* Integraciones cloud
* Notificaciones externas

---

# Stack Tecnológico

## Backend

* Python 3.11+
* FastAPI
* SQLAlchemy
* SQLite
* Pydantic
* Pytest

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Axios
* React Query

---

# Estructura del Proyecto

flujoGestion/
├── ai_history/
├── src/
│ ├── backend/
│ │ ├── venv/
│ │ ├── requirements.txt
│ │ └── app/
│ │ ├── models/
│ │ ├── schemas/
│ │ ├── routers/
│ │ ├── services/
│ │ ├── utils/
│ │ ├── seed/
│ │ ├── main.py
│ │ └── database.py
│ └── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── hooks/
│ │ ├── types/
│ │ ├── utils/
│ │ ├── App.tsx
│ │ └── main.tsx
│ ├── package.json
│ └── vite.config.ts
├── tests/
├── README.md
├── spec.md
├── code_review.md
├── .env.example
└── .gitignore

---

# Arquitectura Backend

Patrón:

Router → Service → Models

## Router

Responsable de:

* Request
* Response
* Validación básica

## Service

Responsable de:

* Reglas de negocio
* Clasificación de pólizas
* Renovación
* Priorización

## Models

Responsable de:

* Persistencia

---

# Entidades

## Client

* id
* full_name
* phone
* email
* document_number
* notes
* created_at

## Policy

* id
* client_id
* policy_type
* insurer
* policy_number
* expiration_date
* status
* premium
* last_contact_at
* renewal_count
* created_at
* updated_at

## ContactLog

* id
* policy_id
* contact_type
* message
* result
* next_follow_up
* created_at

---

# Arquitectura Frontend

## Dashboard

KPIs superiores.

## PoliciesTable

Centro de la aplicación.

## PolicyRow

Fila operacional.

## FilterBar

Filtros rápidos.

## ContactModal

Seguimiento y notas.

---

# UX Definida

La aplicación debe sentirse como:

"Una bandeja operacional de trabajo"

NO como:

* CRM enterprise
* Dashboard financiero
* ERP corporativo

Prioridades:

* Velocidad
* Claridad
* Productividad

---

# Colores Operacionales

* Verde → ACTIVE
* Amarillo → EXPIRING_SOON
* Naranja → OVERDUE
* Rojo → LOST

---

# Estrategia de Testing

Casos críticos:

* Clasificación de pólizas
* Regla de 30 días
* Renovación
* Priorización

Evitar tests triviales.

---

# Estrategia ClaudeCode

## Master Prompt

Definir:

* negocio
* stack
* arquitectura
* restricciones
* UX
* reglas

## Prompts especializados

### Backend

Modelos
Schemas
Routers
Services

### Frontend

Dashboard
Tabla
Filtros
Badges

### Testing

Pytest
Reglas críticas

### Refactor

Consistencia
Naming
Arquitectura

---

# Funcionalidades Planeadas

## Dashboard

* Cards KPI
* Tabla operacional
* Estados visuales

## Acciones rápidas

* Renovar póliza
* Registrar contacto
* Agregar nota
* WhatsApp

## Filtros

* Estado
* Cliente
* Aseguradora
* Riesgo

## CRUD Clientes

* Listar
* Crear
* Editar
* Eliminar
* Ver detalle

## Notas

Agregar columna "Notas" junto a Estado dentro de la tabla de pólizas.

Mostrar:

* resumen corto
* indicador visual
* acceso rápido

---

# Entrega Final

## Archivos requeridos

* README.md
* spec.md
* code_review.md
* ai_history/

## Restricciones

* Sin Docker obligatorio
* SQLite local
* .env.example
* Ejecución simple

## Objetivo Final

Construir una herramienta operacional que permita a María identificar y gestionar rápidamente pólizas críticas antes de perder clientes.
