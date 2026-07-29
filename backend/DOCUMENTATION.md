# 📚 Documentación Viva del Backend & Especificaciones Técnicas

## 1. Esquema de Variables de Entorno y Claves de Encriptación
| Variable | Tipo | Sensible | Descripción |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | No | Puerto de escucha HTTP. |
| `NODE_ENV` | String | No | Entorno de despliegue (`development`, `production`). |
| `CORS_ORIGIN` | String | No | Orígenes permitidos por CORS. |
| `DATABASE_URL` | String | Sí | Cadena de conexión cifrada a la BD. |
| `JWT_SECRET` | String | **SÍ (CRÍTICO)** | Clave secreta base para JWT (Debe migrarse a RS256/ES256 o clave fuerte de 256 bits según protocolo). |

## 2. Inventario de Módulos y Funciones

### Módulo: `EncryptionService` (`src/security/encryption.service.ts`)
* **`encryptPayloadAES256GCM(plainText, secretKeyHex)`**
  * **Propósito:** Cifra un payload usando AES-256-GCM y genera un IV único aleatorio.
  * **Parámetros:** `plainText: string`, `secretKeyHex: string` (Clave en Hexadecimal de 32 bytes).
  * **Retorno:** `{ encryptedData: string, initializationVector: string, authTag: string }`
  * **Excepciones:** `EncryptionFailedException`
* **`decryptPayloadAES256GCM(encryptedPayload, secretKeyHex)`**
  * **Propósito:** Descifra un payload y verifica su integridad mediante AuthTag.
  * **Parámetros:** `encryptedPayload: IEncryptedPayload`, `secretKeyHex: string`.
  * **Retorno:** `string` (Texto plano original).
  * **Excepciones:** `EncryptionFailedException`

## 3. Registro de Endpoints REST & Requisitos de Seguridad

### `GET /api/v1/health`
* **Rate Limit:** 100 peticiones por 15 min (Manejo en memoria nativa).
* **Middlewares:** `RateLimitMiddleware`, `Helmet`, `HPP`.
* **Respuesta Exitosa (200):** `{ "status": "healthy", "timestamp": "...", "environment": "...", "service": "bucare-backend" }`
