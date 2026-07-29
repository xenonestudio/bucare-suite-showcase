#!/bin/bash
# Script de despliegue para Bucare Suite (Linux/macOS/Git Bash)

# Configuración
VM_USER="deploy"
VM_IP="35.254.151.234"
SSH_KEY="~/.ssh/bucare_gcp"
VM_DIR="/home/deploy/app"

echo "=== 1. Compilando Backend ==="
cd backend
npm run build
cd ..

echo "=== 2. Compilando Frontend ==="
npm run build

echo "=== 3. Creando archivos de despliegue ==="
tar -czf frontend.tar.gz .output
tar -czf deploy.tar.gz -C backend dist prisma package.json package-lock.json

echo "=== 4. Subiendo archivos a la VM ==="
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no frontend.tar.gz "$VM_USER@$VM_IP:/home/deploy/"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no deploy.tar.gz "$VM_USER@$VM_IP:/home/deploy/"

echo "=== 5. Extrayendo y reiniciando servicios en la VM ==="
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VM_USER@$VM_IP" "
  tar -xzf /home/deploy/frontend.tar.gz -C $VM_DIR/
  tar -xzf /home/deploy/deploy.tar.gz -C $VM_DIR/backend/
  cd $VM_DIR/backend
  npx prisma db push
  pm2 restart all
"

echo "=== 6. Limpiando archivos locales ==="
rm frontend.tar.gz deploy.tar.gz

echo "🚀 ¡Despliegue completado con éxito!"
