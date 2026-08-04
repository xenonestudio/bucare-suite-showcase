import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, authorizeRoles } from '../../shared/middlewares/auth.middleware.js';


const router = Router();
const prisma = new PrismaClient();

// Default fallback data for all sections
const DEFAULT_SITE_CONTENT: Record<string, any> = {
  hero: {
    title: 'HOGARES QUE\nTE INSPIRAN',
    subtitle: 'Traemos estilo, serenidad y lujo a través de arquitectura inteligente en el corazón de Nueva Guayana.',
    mainImage: '',
    statsNumber: '50+',
    statsLabel: 'Especialistas dedicados a un vivir sostenible',
    cardImage: '',
    cardText: 'Encuentra el hogar que se ajusta a tu estilo',
  },
  proximo_hogar: {
    title: '¿Y si tu próximo hogar\nya te estuviera esperando?',
    subtitle: 'Explora residencias completamente curadas — cuidadosamente seleccionadas, listas cuando tú lo estés.',
    properties: [
      { name: 'PENTHOUSE BUCARE', price: '$524,000', area: '$6,390/m²', img: '', link: '/residencias' },
      { name: 'VISTA CORDILLERA', price: '', area: '', img: '', link: '/residencias' },
      { name: 'SUITE MIRADOR', price: '', area: '', img: '', link: '/contacto' },
    ],
  },


  residencias: {
    title: 'Seis formas\nde vivir Bucare',
    subtitle: 'Cada modelo está pensado para un ritmo de vida distinto. Selecciona una tipología para conocer su plano y ver cómo se materializa.',
    models: [
      { 
        id: '01', name: 'MODELO 01', area: '31.60 m²', bedrooms: '1 hab.', bathrooms: '1 baño', balcony: 'Jardinera / Balcón frontal',
        distribution: ['Acceso / Ingreso central.', 'Baño completo accesible cerca de la entrada.', 'Área integradora de comedor y cocina lineal.', 'Habitación principal integrada con vista y salida hacia el balcón/jardinera.'],
        plan: '/modelos/mapa_modelo01.webp', render: '/modelos/Imagen_modelo01.webp'
      },
      { 
        id: '02', name: 'MODELO 02', area: '45.03 m²', bedrooms: '1 hab.', bathrooms: '1 baño', balcony: 'Balcón / Área verde frontal',
        distribution: ['Acceso / Ingreso con área de recibidor.', 'Baño completo.', 'Cocina en L / Comedor auxiliar circular.', 'Zona de trabajo o escritorio.', 'Habitación espaciosa con salida a balcón con jardines.'],
        plan: '/modelos/mapa_modelo02.webp', render: '/modelos/Imagen_modelo02.webp'
      },
      { 
        id: '03', name: 'MODELO 03', area: '56.70 m²', bedrooms: '2 hab.', bathrooms: '2 baños', balcony: 'Balcón',
        distribution: ['Ingreso a la zona social (sala de estar).', 'Cocina abierta integrada con barra/comedor.', '2 habitaciones (habitación principal con baño privado y habitación secundaria).', '2 baños completos.', 'Balcón continuo en la fachada posterior/lateral.'],
        plan: '/modelos/mapa_modelo03.webp', render: '/modelos/Imagen_modelo03.webp'
      },
      { 
        id: '04', name: 'MODELO 04', area: '63.23 m²', bedrooms: '2 hab.', bathrooms: '2 baños', balcony: 'Balcón',
        distribution: ['Ingreso con recibidor.', 'Cocina amplia integrada a comedor central.', 'Sala de estar acogedora.', 'Habitación principal de gran tamaño y habitación secundaria.', '2 baños completos.', 'Balcón.'],
        plan: '/modelos/mapa_modelo04.webp', render: '/modelos/Imagen_modelo04.webp'
      },
      { 
        id: '05', name: 'MODELO 05', area: '73.88 m²', bedrooms: '2 hab.', bathrooms: '2 baños', balcony: 'Balcones amplios',
        distribution: ['Acceso con área de cocina en isla / barra desayunadora y área de servicios.', 'Sala de estar amplia con salida directa a amplio balcón con vegetación.', '2 habitaciones de excelente tamaño.', '2 baños completos.', 'Balcones extensos con jardineras.'],
        plan: '/modelos/mapa_modelo05.webp', render: '/modelos/Imagen_modelo05.webp'
      },
      { 
        id: '06', name: 'MODELO 06', area: '86.91 m²', bedrooms: '3 hab.', bathrooms: '2 baños', balcony: 'Balcones',
        distribution: ['Es el modelo de mayor área del condominio.', 'Acceso/Ingreso directo a área social con sala y amplio comedor.', 'Cocina moderna en L integrando la zona social.', '3 habitaciones (habitación principal con baño suite y 2 habitaciones secundarias/estudio).', '2 baños completos.', 'Múltiples balcón/jardineras que bordean los espacios principales.'],
        plan: '/modelos/mapa_modelo06.webp', render: '/modelos/Imagen_modelo06.webp'
      },
    ]
  },
  areas: {
    title: 'Vida más allá\nde tu residencia',
    subtitle: 'Seis ambientes diseñados para trabajar, descansar, conectar y disfrutar sin salir de Bucare Suite.',
    list: [
      { id: 'coworking', name: 'Coworking', description: 'Espacio de trabajo compartido con iluminación natural, conectividad de alta velocidad y cabinas para videollamadas.', img: '/areas/coworking.webp' },
      { id: 'plaza', name: 'Plaza Central', description: 'Plaza paisajística con vegetación local, bancas y zonas de descanso al aire libre.', img: '/areas/plaza.webp' },
      { id: 'lobby', name: 'Lobby Principal', description: 'Recepción de doble altura con acabados en piedra, madera y iluminación cálida de bienvenida.', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600' },
      { id: 'entrada', name: 'Acceso & Entrada', description: 'Acceso peatonal y vehicular con porte cochere, control de acceso y seguridad las 24 horas.', img: '/areas/entrada.webp' },
      { id: 'gym', name: 'Gimnasio Equipado', description: 'Gimnasio equipado con máquinas de cardio, pesas libres y zona funcional para entrenamiento completo.', img: '/areas/gym.webp' },
      { id: 'terraza', name: 'Terraza Social', description: 'Rooftop con vistas a la ciudad, zona de lounge, barra gourmet y espacio para eventos sociales.', img: '/areas/terraza-social.webp' },
    ],
  },
  contacto: {
    title: 'Hablemos\nde tu próximo\nhogar',
    subtitle: 'Nuestro equipo te atiende de lunes a sábado. Responde este formulario y agendaremos una visita privada al edificio o una llamada.',
    address: 'QQJC+93C San Cristóbal 5001\nNueva Guayana, Venezuela',
    phone: '+58 (276) 000-0000 / 0424 283 1342',
    email: 'hola@bucaresuite.com',
  },
};

// GET /api/v1/site-content -> Obtener todos los contenidos del sitio
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const contents = await prisma.siteContent.findMany();
    const result: Record<string, any> = { ...DEFAULT_SITE_CONTENT };

    contents.forEach((item) => {
      try {
        result[item.section] = JSON.parse(item.data);
      } catch (err) {
        console.error(`Error parsing site_content section ${item.section}:`, err);
      }
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/site-content -> Actualizar la información de una sección
router.put('/', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { section, data } = req.body;
    if (!section || !data) {
      res.status(400).json({ success: false, message: 'Faltan parámetros section o data.' });
      return;
    }

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);

    const updated = await prisma.siteContent.upsert({
      where: { section },
      update: { data: dataString },
      create: { section, data: dataString },
    });

    res.status(200).json({
      success: true,
      message: `Sección ${section} actualizada correctamente.`,
      data: {
        section: updated.section,
        data: JSON.parse(updated.data),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
