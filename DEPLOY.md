# Guía de Despliegue — Bucare Suite

Este documento contiene las instrucciones y la estandarización para compilar y desplegar los cambios de Bucare Suite en la máquina virtual (VM) de Google Cloud.

## Arquitectura de Producción

- **Servidor Web / Proxy Inverso:** Nginx.
- **Gestor de Procesos:** PM2.
- **Puerto Frontend (SSR):** 3000 (Node.js).
- **Puerto Backend:** 5000 (Express).
- **Base de Datos:** SQLite (`prod.db` dentro de `/home/deploy/app/backend/prisma/`).
- **Directorio de la Aplicación en la VM:** `/home/deploy/app`

---

## Requisitos Previos (Local)

Para poder desplegar desde tu máquina local, debes asegurarte de tener:
1. Acceso SSH configurado con la llave privada `bucare_gcp` ubicada en la ruta por defecto:
   - **Linux/macOS:** `~/.ssh/bucare_gcp`
   - **Windows:** `C:\Users\<tu-usuario>\.ssh\bucare_gcp`
2. Node.js instalado localmente.

---

## Scripts de Despliegue Automatizados

Hemos creado dos scripts en la raíz del proyecto para automatizar todo el proceso:

### 1. En Windows (PowerShell)
Abre una terminal de PowerShell y ejecuta:
```powershell
.\deploy.ps1
```

### 2. En Linux / macOS / Git Bash
Abre una terminal y ejecuta:
```bash
chmod +x deploy.sh
./deploy.sh
```

### ¿Qué hace el script de despliegue?
1. Compila el Backend (`npm run build` en `backend`).
2. Compila el Frontend (`npm run build` en la raíz).
3. Empaqueta el frontend (`.output`) y backend (`dist`, `prisma`, `package.json`, etc.) en archivos `.tar.gz`.
4. Sube las compilaciones a la VM utilizando la llave SSH `bucare_gcp`.
5. Extrae los archivos directamente en el directorio correspondiente de la VM.
6. Sincroniza la base de datos de producción (`npx prisma db push`).
7. Reinicia los procesos con PM2 para aplicar los cambios sin caída del servicio.
8. Limpia los archivos `.tar.gz` locales creados temporalmente.

---

## Gestión de la Aplicación en la VM (SSH Manual)

Si necesitas entrar a la VM manualmente para revisar el estado o solucionar problemas, conéctate usando:
```bash
ssh -i ~/.ssh/bucare_gcp deploy@35.254.151.234
```

### Comandos Útiles en la VM:

#### 1. Ver estado de los procesos (PM2)
```bash
pm2 status
# O versión interactiva en vivo
pm2 monit
```

#### 2. Ver logs en tiempo real
```bash
# Ver todos los logs
pm2 logs

# Ver sólo los errores del backend
pm2 logs bucare-backend --err
```

#### 3. Reiniciar servicios manualmente
```bash
pm2 restart all
# O de forma individual
pm2 restart bucare-backend
pm2 restart bucare-frontend
```

#### 4. Configurar Variables de Entorno (.env)
El backend utiliza un archivo `.env` ubicado en `/home/deploy/app/backend/.env`. Si necesitas cambiar la clave secreta o los orígenes permitidos por CORS:
```bash
nano /home/deploy/app/backend/.env
# Tras guardar, reinicia el backend: pm2 restart bucare-backend
```
