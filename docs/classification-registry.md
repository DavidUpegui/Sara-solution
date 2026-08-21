# Classification Registry

This registry is mirrored by `public/classification-registry.json` and is the authoritative vocabulary for F1. The AI must use existing values exactly and must not create colors or labels.

## Categories

| Value | Description | Color |
|---|---|---|
| `Torre Aurora` | Correo relacionado con Torre Aurora. | `#2F6F7E` |
| `Mirador del Este` | Correo relacionado con Mirador del Este. | `#75619B` |
| `Bosque 47` | Correo relacionado con Bosque 47. | `#6A9C80` |
| `Sin proyecto identificado` | No se identifica un proyecto. | `#817D76` |

`Sin proyecto identificado` is the controlled fallback when the email does not identify one of the registered projects.

## Urgency

| Value | Meaning | Rank | Color |
|---|---|---:|---|
| `Alta` | Requiere atención inmediata. | 1 | `#C95743` |
| `Media` | Requiere atención en un plazo razonable. | 2 | `#C58A42` |
| `Baja` | Puede atenderse en un momento más conveniente. | 3 | `#6A9C80` |

The list is ordered by urgency rank ascending, then by email date ascending within the same urgency level.