import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT, authorizeRoles } from '../../shared/middlewares/auth.middleware.js';
import prisma from '../../lib/prisma.js';

const router = Router();

// Default fallback data for all sections
const DEFAULT_SITE_CONTENT: Record<string, any> = {
  hero: {
    title: 'HOGARES QUE\nTE INSPIRAN',
    subtitle: 'Traemos estilo, serenidad y lujo a través de arquitectura inteligente en el corazón de Nueva Guayana.',
    mainImage: '',
    mainVideo: '',
    statsNumber: '50+',
    statsLabel: 'Especialistas dedicados a un vivir sostenible',
    cardImage: '',
    cardText: 'Encuentra el hogar que se ajusta a tu estilo',
  },
  proximo_hogar: {
    title: '¿Y si tu próximo hogar\nya te estuviera esperando?',
    subtitle: 'Explora apartamentos completamente curados — cuidadosamente seleccionados, listas cuando tú lo estés.',
    properties: [
      { name: 'PENTHOUSE BUCARE', price: '$524,000', area: '$6,390/m²', img: '', link: '/apartamentos' },
      { name: 'VISTA CORDILLERA', price: '', area: '', img: '', link: '/apartamentos' },
      { name: 'SUITE MIRADOR', price: '', area: '', img: '', link: '/contacto' },
    ],
  },


  apartamentos: {
    title: 'Seis formas\nde vivir Bucare',
    subtitle: 'Cada modelo está pensado para un ritmo de vida distinto. Selecciona una tipología para conocer su plano y ver cómo se materializa.',
    models: [
      { 
        id: '01', name: 'MODELO 01', area: '31.60 m²', bedrooms: '1 hab.', bathrooms: '1 baño', balcony: 'Jardinera / Balcón frontal', parking: '1 puesto de estacionamiento',
        distribution: ['Acceso / Ingreso central.', 'Baño completo accesible cerca de la entrada.', 'Área integradora de comedor y cocina lineal.', 'Habitación principal integrada con vista y salida hacia el balcón/jardinera.'],
        plan: '/modelos/mapa_modelo01.jpg', render: '/modelos/Imagen_modelo01.jpg'
      },
      { 
        id: '02', name: 'MODELO 02', area: '45.03 m²', bedrooms: '1 hab.', bathrooms: '1 baño', balcony: 'Balcón / Área verde frontal', parking: '1 puesto de estacionamiento',
        distribution: ['Acceso / Ingreso con área de recibidor.', 'Baño completo.', 'Cocina en L / Comedor auxiliar circular.', 'Zona de trabajo o escritorio.', 'Habitación espaciosa con salida a balcón con jardines.'],
        plan: '/modelos/mapa_modelo02.jpg', render: '/modelos/Imagen_modelo02.jpg'
      },
      { 
        id: '03', name: 'MODELO 03', area: '56.70 m²', bedrooms: '2 hab.', bathrooms: '2 baños', balcony: 'Balcón', parking: '1 puesto de estacionamiento',
        distribution: ['Ingreso to la zona social (sala de estar).', 'Cocina abierta integrada con barra/comedor.', '2 habitaciones (habitación principal con baño privado y habitación secundaria).', '2 baños completos.', 'Balcón continuo en la fachada posterior/lateral.'],
        plan: '/modelos/mapa_modelo03.jpg', render: '/modelos/Imagen_modelo03.jpg'
      },
      { 
        id: '04', name: 'MODELO 04', area: '63.23 m²', bedrooms: '2 hab.', bathrooms: '2 baños', balcony: 'Balcón', parking: '1 puesto de estacionamiento',
        distribution: ['Ingreso con recibidor.', 'Cocina amplia integrada a comedor central.', 'Sala de estar acogedora.', 'Habitación principal de gran tamaño y habitación secundaria.', '2 baños completos.', 'Balcón.'],
        plan: '/modelos/mapa_modelo04.jpg', render: '/modelos/Imagen_modelo04.jpg'
      },
      { 
        id: '05', name: 'MODELO 05', area: '73.88 m²', bedrooms: '2 hab.', bathrooms: '2 baños', balcony: 'Balcones amplios', parking: '1 puesto de estacionamiento',
        distribution: ['Acceso con área de cocina en isla / barra desayunadora y área de servicios.', 'Sala de estar amplia con salida directa a amplio balcón con vegetación.', '2 habitaciones de excelente tamaño.', '2 baños completos.', 'Balcones extensos con jardineras.'],
        plan: '/modelos/mapa_modelo05.jpg', render: '/modelos/Imagen_modelo05.jpg'
      },
      { 
        id: '06', name: 'MODELO 06', area: '86.91 m²', bedrooms: '3 hab.', bathrooms: '2 baños', balcony: 'Balcones', parking: '2 puestos de estacionamiento',
        distribution: ['Es el modelo de mayor área del edificio.', 'Acceso/Ingreso directo a área social con sala y amplio comedor.', 'Cocina moderna en L integrando la zona social.', '3 habitaciones (habitación principal con baño suite y 2 habitaciones secundarias/estudio).', '2 baños completos.', 'Múltiples balcón/jardineras que bordean los espacios principales.'],
        plan: '/modelos/mapa_modelo06.jpg', render: '/modelos/Imagen_modelo06.jpg'
      },
    ]
  },
  areas: {
    title: 'Vida más allá\nde tu apartamento',
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
  comercial: {
    hero: {
      title: "bucare\nplaza",
      subtitle: "El escenario comercial donde las mejores marcas de la ciudad encuentran su hogar.",
      mainImage: "/comercial/025.jpeg",
      video: "",
      statsNumber: "87%",
      statsLabel: "locales activos",
    },
    proyecto: {
      title: "Diseñado para el\néxito de tu marca.",
      subtitle: "01 El Proyecto",
      desc1: "Bucare Plaza es la plaza comercial boutique del proyecto Bucare, concebida como un ecosistema de marcas curadas que comparten valores: calidad, diseño y experiencia de cliente.",
      desc2: "Ubicada en la planta baja del complejo Bucare Suite & Plaza, tiene frente a dos calles principales y comparte flujo de visitas con los residentes de las 60 unidades habitacionales de la torre.",
      image: "/comercial/027.jpeg",
      video: "",
      bullets: [
        { text: "San Cristóbal, Estado Táchira" },
        { text: "Planta baja + segunda planta de oficinas" },
        { text: "Flujo estimado: 2,500 personas/día" },
      ],
    },
    stats: [
      { valor: "1,200", unidad: "m²", label: "Área Total Construida" },
      { valor: "8",     unidad: "+",  label: "Locales Comerciales" },
      { valor: "2",     unidad: "",   label: "Niveles" },
      { valor: "20",    unidad: "",   label: "Puestos de Parking" },
    ],
    ventajas: [
      { num: "01", titulo: "Ubicación Estratégica Premium", desc: "Posicionado en el eje comercial más activo de San Cristóbal, con acceso directo desde las principales vías y visibilidad desde ambas calles laterales. Flujo peatonal estimado de 2,500 personas diarias." },
      { num: "02", titulo: "Arquitectura Contemporánea de Alto Impacto", desc: "Fachada moderna de concreto, vidrio templado y detalles en madera natural. Un edificio pensado para que cada local tenga presencia visual máxima desde el exterior." },
      { num: "03", titulo: "Concepto Mixto Comercial + Apartamentos", desc: "La planta baja alberga locales comerciales y la planta alta oficinas boutique y consultorios. Esto garantiza un flujo constante de clientes residentes de Bucare Suite durante todo el día." },
      { num: "04", titulo: "Seguridad y Operación 24/7", desc: "CCTV de última generación, personal de vigilancia y control de acceso vehicular. Tu negocio protegido en todo momento con sistemas integrados al edificio." },
      { num: "05", titulo: "Estacionamiento Privado Exclusivo", desc: "20 puestos de estacionamiento techados con iluminación LED, reservados para clientes y arrendatarios. Sin estrés de parqueo para tus visitantes." },
    ],
    locales: [
      { id: "01", nombre: "Hábito Café", categoria: "Gastronomía & Café", img: "/comercial/025.webp", desc: "Experiencia gastronómica curada con los mejores granos de especialidad. Terraza abierta con vista a la plaza.", area: "85 m²", status: "Ancla" },
      { id: "02", nombre: "Coralia Boutique", categoria: "Moda & Estilo", img: "/comercial/029.webp", desc: "Espacio fashion de alto nivel con selección curada de moda contemporánea y accesorios de diseñador.", area: "65 m²", status: "Activo" },
      { id: "03", nombre: "Beauty Lab", categoria: "Salud & Belleza", img: "/comercial/030.webp", desc: "Centro de estética y bienestar con los últimos tratamientos dermatológicos y cosméticos de vanguardia.", area: "70 m²", status: "Activo" },
      { id: "04", nombre: "Motors", categoria: "Automóvil & Lifestyle", img: "/comercial/028.webp", desc: "Showroom premium para vehículos y accesorios de alto rendimiento en un espacio arquitectónico único.", area: "120 m²", status: "Disponible" },
    ],
    socials: {
      instagram: "https://instagram.com/bucareplaza",
      facebook: "https://facebook.com/bucareplaza",
    },
  },
  faq: {
    title: "Todo lo que necesitas\nsaber antes de encontrar\ntu próximo hogar",
    items: [
      { q: "¿Dónde se ubica Bucare Suite?", a: "En QQJC+93C, San Cristóbal 5001, Nueva Guayana. Un enclave privado con acceso rápido al centro y a los principales corredores de la ciudad." },
      { q: "¿Qué tipologías de apartamento ofrecen?", a: "Suites de 1 y 2 habitaciones, penthouses y áticos con terraza. Cada unidad está finalizada con acabados premium y grandes ventanales." },
      { q: "¿Cómo puedo agendar una visita?", a: "Reserve una visita privada desde el botón superior o contáctenos directamente. Coordinamos recorridos guiados presenciales y virtuales." },
      { q: "¿Ofrecen planes de financiamiento?", a: "Sí. Trabajamos con planes personalizados y aliados financieros para adaptarnos a distintos perfiles de inversión." },
    ],
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
