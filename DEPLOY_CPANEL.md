# Guía de Despliegue en cPanel vía FTP — Bucare Suite

Esta guía detalla los pasos para compilar, configurar y desplegar Bucare Suite en un servidor **cPanel** (para el dominio **bucaresuite.com**), utilizando **FTP** para subir los archivos y un ejecutor PHP automático para extraerlos sin requerir acceso SSH directo.

---

## 1. Despliegue Manual Desde Tu Computadora

Los scripts manuales compilarán el proyecto localmente, subirán los paquetes comprimidos a cPanel a través de FTP, colocarán un script `deploy_helper.php` en tu web root, y realizarán una petición HTTP para extraer los archivos instantáneamente y reiniciar el servidor Node de cPanel.

- **En Windows (PowerShell):**
  ```powershell
  .\deploy_cpanel.ps1
  ```
- **En Linux / macOS / Git Bash:**
  ```bash
  chmod +x deploy_cpanel.sh
  ./deploy_cpanel.sh
  ```

> [!TIP]
> Puedes abrir `deploy_cpanel.sh` o `deploy_cpanel.ps1` para cambiar las rutas remotas de destino si la estructura de carpetas en tu cPanel difiere.

---

## 2. Despliegue Automatizado con GitHub Actions

El archivo de workflow [deploy.yml](file:///.github/workflows/deploy.yml) compilará el código en la nube de GitHub y lo subirá por FTP al cPanel cada vez que hagas `push` a la rama `main`.

Para que funcione, debes agregar los siguientes **Secrets** en tu repositorio de GitHub (**Settings > Secrets and variables > Actions > New repository secret**):

| Nombre del Secret | Valor a ingresar |
| :--- | :--- |
| `FTP_HOST` | `lexsank.xyz` |
| `FTP_USER` | `lexsankx` |
| `FTP_PASS` | `2887245.Alex.` |
| `FTP_PORT` | `21` |
| `REMOTE_FRONTEND_DIR` | `app_frontend/` |
| `REMOTE_BACKEND_DIR` | `app_backend/` |
| `REMOTE_PUBLIC_HTML` | `public_html/` |

---

## 3. Configuración en cPanel (Setup Node.js App)

cPanel maneja los procesos de Node.js mediante Phusion Passenger. Para servir la aplicación:

1. Entra a tu cPanel y ve a **"Setup Node.js App"**.
2. Registra las dos aplicaciones configurando la versión de Node.js en 20:
   - **Frontend App:**
     - **Application URL:** `demo.bucaresuite.com`
     - **Application root:** `app_frontend` (o `bucaresuite/frontend`)
     - **Application startup file:** `.output/server/index.mjs`
   - **Backend App:**
     - **Application URL:** `api-demo.bucaresuite.com` (o la ruta que elijas)
     - **Application root:** `app_backend` (o `bucaresuite/backend`)
     - **Application startup file:** `dist/server.js`

### 4. Prevención de Procesos Zombie y Optimización de Memoria (Passenger)

Para evitar que la aplicación consuma el 100% de los procesos asignados por el hosting cPanel:

1. **startup file directo:** Asegúrate de usar `.output/server/index.mjs` (Frontend) y `dist/server.js` (Backend) como `Application startup file` en lugar de comandos o scripts `npm run start`.
2. **Configuración de Phusion Passenger (`.htaccess`):**
   Los archivos `.htaccess` en la raíz de cada app ya incluyen las siguientes directivas recomendadas:
   ```apache
   PassengerMinInstances 1
   PassengerMaxRequests 5000
   PassengerPoolIdleTime 300
   ```
3. **Limpieza manual/programada:**
   Si se llegan a acumular procesos zombies en el hosting, puedes invocar la URL de limpieza: `http://tu-dominio.com/kill_node_processes.php` o añadir una tarea Cron en cPanel:
   ```bash
   /usr/local/bin/php /home/lexsankx/public_html/kill_node_processes.php >/dev/null 2>&1
   ```

