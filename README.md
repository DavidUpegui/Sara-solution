# Aurora AI

Asistente de correo basado en IA para **Constructora Aurora S.A.S.** Analiza los correos entrantes, los clasifica, extrae la información relevante y propone borradores de respuesta para que **Sara**, asistente de gerencia, los revise y apruebe.

> **La IA propone. Sara decide.**

La aplicación puede ejecutarse tanto en local como en un único contenedor de producción.

---

## Tabla de contenidos

- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
  - [Con Docker](#con-docker)
  - [Directamente desde el repositorio](#directamente-desde-el-repositorio)
- [Decisiones](#decisiones)
  - [Stack tecnológico](#stack-tecnológico)
  - [Arquitectura](#arquitectura)
  - [Modelo de IA (DeepSeek)](#modelo-de-ia-deepseek)
  - [Email history](#email-history)
  - [Categorías como proyectos](#categorías-como-proyectos)
  - [Por qué Docker](#por-qué-docker)
- [Explicación detallada de la arquitectura](#explicación-detallada-de-la-arquitectura)
- [Programación agéntica](#programación-agéntica)

---

## Cómo correr el proyecto

### Con Docker

> Docker es la vía recomendada: evita depender de versiones locales y garantiza que el proyecto se ejecute igual en cualquier máquina.

**1. Clona el repositorio**

```bash
git clone https://github.com/DavidUpegui/Sara-solution
cd Sara-solution
```

**2. Configura las credenciales**

La imagen se construye **sin** ninguna API key (nunca se incrustan secretos en la imagen). Cada persona debe aportar la suya en tiempo de ejecución:

```bash
cp .env.example .env.local
```

Edita `.env.local` y reemplaza el valor de `DEEPSEEK_API_KEY` por tu propia key. Este archivo está ignorado por Git, por lo que nunca se comparte ni se versiona.

**3. Construye y levanta el contenedor**

```bash
docker compose up --build
```

**4. Abre la aplicación**

Visita [http://localhost:3000](http://localhost:3000).

**Comandos útiles**

```bash
docker compose up --build   # construir y levantar
docker compose up -d        # levantar en segundo plano (detached)
docker compose down         # detener y eliminar el contenedor
docker compose logs -f      # seguir los logs en tiempo real
```

> **Nota:** el historial de correos (`data/email-history.json`) vive dentro del contenedor y se reinicia al recrearlo. Es un comportamiento intencional: el historial es solo un mecanismo de caché y puede restablecerse desde la interfaz con el botón **"Borrar caché"**.

### Directamente desde el repositorio

**Requisitos**

| Herramienta | Versión |
|-------------|---------|
| Node.js     | 22 (LTS) o superior |
| npm         | se incluye con Node |

> El `Dockerfile` fija `node:22-alpine`; el proyecto fue desarrollado y probado con Node 24 y npm 11.

**1. Clona e instala las dependencias**

```bash
git clone https://github.com/DavidUpegui/Sara-solution
cd Sara-solution
npm install
```

**2. Configura el entorno**

```bash
cp .env.example .env.local
```

Reemplaza `DEEPSEEK_API_KEY` por tu propia key.

**3. Levanta el servidor de desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

**Scripts disponibles**

```bash
npm run dev     # servidor de desarrollo (hot reload)
npm run lint    # análisis estático con ESLint
npm run build   # build de producción
npm run start   # servidor de producción (requiere haber ejecutado npm run build)
```

---

## Decisiones

### Stack tecnológico

Se eligió **Next.js** por dos razones principales: ofrece integraciones de SDK muy maduras para conectar con modelos de IA y reúne frontend y backend en un único entorno. Esto lo hace ideal para aplicaciones pequeñas cuyo crecimiento no se prevé elevado.

### Arquitectura

Se adoptó una arquitectura de **puertos y adaptadores** (Hexagonal) para desacoplar el núcleo de negocio de las implementaciones concretas, como los modelos de IA o el mecanismo de acceso a datos.

El valor de esta decisión se hizo evidente durante el proyecto con la **migración de Gemini a DeepSeek**: bastó con crear los adaptadores de DeepSeek; el resto de la aplicación no requirió ningún cambio. Lo mismo aplica al acceso a datos —hoy se lee desde archivos JSON, pero migrar a una API externa o a una base de datos implicaría únicamente escribir el adaptador correspondiente.

### Modelo de IA (DeepSeek)

Inicialmente se utilizó la capa gratuita de **Gemini**, pero los tokens se agotaron durante el desarrollo. Se decidió migrar a **DeepSeek**: no es el modelo más potente, pero sí muy económico.

La apuesta fue deliberada: si se lograban buenos resultados con DeepSeek, modelos más potentes del mercado deberían rendir todavía mejor. Esa premisa se mantuvo, y la arquitectura de puertos y adaptadores permitió hacer el cambio de forma limpia.

### Email history

`email-history` actúa como una **base de datos de caché y contexto**. Surgió porque la información que se le pasaba al modelo no era suficiente para asignar categorías correctas ni para redactar borradores satisfactorios.

Con este historial, el modelo puede acceder rápidamente:

- al **contexto** que se definió para cada correo durante su clasificación, y
- a **correos relacionados**, para tener un panorama más completo al clasificar nuevos mensajes o redactar un borrador.

A futuro, este historial podría migrarse a una **base de datos no relacional** para acelerar las búsquedas y mejorar el control general.

### Categorías como proyectos

La categorización ideal requeriría más dimensiones que los simples proyectos existentes, pero la mejor manera de construirla es **con apoyo humano**. Dejar que la IA categorice por su cuenta supondría un consumo excesivo de tokens (y el tiempo de desarrollo era limitado). Por eso, de manera preliminar, las categorías se corresponden únicamente con los proyectos:

- `Torre Aurora`
- `Mirador del Este`
- `Bosque 47`
- `Sin proyecto identificado`

### Por qué Docker

Docker es una solución muy eficaz para exportar proyectos: elimina el clásico *"en mi máquina funcionaba"*, estandariza las versiones y permite ejecutar la aplicación de forma muy sencilla en cualquier entorno.

---

## Explicación detallada de la arquitectura

El proyecto sigue una arquitectura por capas donde las dependencias apuntan siempre **hacia adentro** (las capas externas dependen de las internas, nunca al revés):

```text
domain/           modelos y contratos de negocio (estables, sin dependencias)
application/      casos de uso y puertos (interfaces)
composition/      raíz de composición: conecta adaptadores con los casos de uso
infrastructure/   adaptadores concretos (acceso a datos, integración con IA)
app/              límite HTTP y presentación (Next.js App Router)
public/           datos de ejemplo y assets públicos
```

### `domain/`

Contiene los **modelos de negocio** y los **contratos de dominio**, independientes de frameworks e infraestructura:

- `Email.ts` — modelo del correo (`id`, `de`, `nombre`, `fecha`, `asunto`, `cuerpo`).
- `EmailClassification.ts` — resultado de la clasificación (categoría, urgencia, razón y metadatos de color/rank).
- `EmailHistoryNode.ts` — nodo del historial de un correo (`keyValues`, `relatedNodes`, `context`, etc.).

Esta capa no importa nada de `infrastructure/` ni de `app/`.

### `application/`

Contiene los **casos de uso** (lógica de negocio) y los **puertos** (interfaces que la aplicación define y que la infraestructura implementa):

- `classify-email/` — `ClassifyEmails` (orquesta la clasificación, con caché) y el puerto `EmailClassifier`.
- `generate-draft/` — `GenerateDraftForEmail`, `GenerateDraft`, el puerto `DraftGenerator` y el contrato `GeneratedDraft`.
- `get-email/` — el puerto `EmailRepository` para obtener correos.
- `history/` — `GetEmailContext`, `ResetEmailHistory`, y los puertos `EmailHistoryRepository` y `EmailContextGenerator`.

Los casos de uso dependen únicamente de puertos, nunca de implementaciones concretas. Gracias a esto, cambiar de proveedor de IA o de almacenamiento no afecta a esta capa.

### `composition/`

Es la **raíz de composición**. En `email.ts` se instancian los adaptadores concretos y se inyectan en los casos de uso:

```ts
const emailRepository = new JsonEmailRepositoryAdapter();
const emailClassifier = new DeepSeekEmailClassifier();
// ...
export const classifyEmails = new ClassifyEmails(emailClassifier, getEmailContext);
```

Aquí se decide *qué* implementación concreta se usa. Cambiar de proveedor o de repositorio implica editar solo este archivo.

### `infrastructure/`

Implementa los puertos definidos en `application/`:

- `data-acces/json/` — `JsonEmailRepositoryAdapter` (lee `public/correos-ejemplo.json`) y `JsonEmailHistoryRepositoryAdapter` (lee/escribe `data/email-history.json`).
- `ai/deepseek/` — `DeepSeekEmailClassifier`, `DeepSeekDraftGenerator` y `DeepSeekEmailContextGenerator` (usan el SDK de OpenAI apuntando a la URL base de DeepSeek).
- `ai/gemini/` — los adaptadores equivalentes para Gemini (empleados antes de la migración).
- `ai/prompts/` — los *system prompts* en Markdown que lee cada adaptador.

### `app/`

Límite HTTP y presentación con Next.js App Router:

- `page.tsx`, `layout.tsx` y `globals.css` — entrada de la ruta `/`, layout raíz y estilos globales.
- `api/` — rutas HTTP:
  - `GET /api/emails` — clasifica los correos en *streaming*.
  - `POST /api/emails/draft` — genera un borrador de respuesta.
  - `DELETE /api/emails/history` — borra la caché de historial.

  Estas rutas traducen peticiones HTTP y **no** contienen lógica de repositorio ni de modelos de IA.
- `email-workspace/` — componentes de cliente (`EmailWorkspace`, `EmailList`, `EmailDetail`, `DraftWriter`) y helpers de UI. El navegador solo se comunica con las rutas de `api/`; nunca importa `composition/` ni `infrastructure/`.

### `public/`

- `correos-ejemplo.json` — los 25 correos ficticios de ejemplo.
- `classification-registry.json` — el vocabulario autoritativo de categorías y urgencias que el modelo debe respetar.

### Flujo de una clasificación

```text
GET /api/emails
  -> JsonEmailRepositoryAdapter.findAll()            (infrastructure)
  -> ClassifyEmails.executeSequential()              (application)
       -> GetEmailContext.get()                      (application)
            -> JsonEmailHistoryRepositoryAdapter     (infrastructure)
       -> DeepSeekEmailClassifier.classify()         (infrastructure)
       -> JsonEmailHistoryRepositoryAdapter.save()   (infrastructure)
```

---

## Programación agéntica

Buena parte de los archivos del repositorio no forman parte de la aplicación en sí: existen para **dar contexto y reglas a los agentes de IA** (Copilot, Claude, etc.) durante el desarrollo.

| Archivo / carpeta | Propósito |
|---|---|
| `AGENTS.md` | Instrucciones a nivel de repositorio. Incluye el aviso de que esta versión de Next.js tiene *breaking changes* y que debe consultarse `node_modules/next/dist/docs/`. Es referenciado por `CLAUDE.md`. |
| `.github/copilot-instructions.md` | Instrucciones principales: stack, comandos, arquitectura, límites cliente/servidor, seguridad y lista de documentos de contexto. |
| `.github/instructions/` | Instrucciones acotadas por área mediante frontmatter (`applyTo`). |
| `.github/prompts/` | Prompts reutilizables para tareas concretas. |
| `docs/` | Documentos de contexto de producto y arquitectura que los agentes leen antes de implementar. |

### Detalle de `.github/instructions/`

- `frontend.instructions.md` — aplica a `app/**/*.tsx` y `app/**/*.css` (límites de componentes, API boundary y convenciones visuales).
- `server-email.instructions.md` — aplica a `app/api`, `application`, `domain`, `composition` e `infrastructure` (dirección de dependencias, contratos y seguridad).

### Detalle de `.github/prompts/`

- `implement-f1-classification.prompt.md` — guía paso a paso para implementar una feature (en este caso, la clasificación de correos).

### Detalle de `docs/`

- `product.md` — visión, usuario, límites y criterios de éxito del MVP.
- `features.md` — las cinco funcionalidades obligatorias y las extensiones opcionales.
- `requirements.md` — requisitos funcionales y no funcionales, con su estado de implementación.
- `business-rules.md` — reglas de aprobación humana, comunicación y seguridad de la IA.
- `architecture.md` — pipeline objetivo del MVP y orden de implementación.
- `decisions.md` — decisiones aceptadas y pendientes.
- `business-context.md` — contexto confirmado y detalles operativos aún sin resolver.

En conjunto, estos archivos permiten que un agente entienda el proyecto, sus límites y sus convenciones sin adivinar, manteniendo la dirección de dependencias y las reglas de negocio.
