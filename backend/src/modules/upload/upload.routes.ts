import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, authorizeRoles } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

// Directorio público de uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/v1/upload -> Cargar archivo de imagen en formato base64 / data URL
router.post('/', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { image, fileName } = req.body;

    if (!image) {
      res.status(400).json({ success: false, message: 'No se envió la imagen para procesar.' });
      return;
    }

    // Extraer base64 y tipo MIME
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      ext = mimeType.split('/')[1] || 'png';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      // Si ya viene como base64 puro
      buffer = Buffer.from(image, 'base64');
    }

    // Validar tamaño máximo (20MB)
    if (buffer.length > 20 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'La imagen excede el límite permitido de 20MB.' });
      return;
    }


    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanFileName = fileName ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image';
    const finalFileName = `${cleanFileName}-${uniqueSuffix}.${ext}`;
    const filePath = path.join(uploadsDir, finalFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${finalFileName}`;

    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente.',
      data: {
        url: publicUrl,
        filename: finalFileName,
        size: buffer.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
