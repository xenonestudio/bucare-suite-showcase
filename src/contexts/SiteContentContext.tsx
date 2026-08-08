import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import heroBuilding from "@/assets/hero-building.webp";
import property1 from "@/assets/property-1.webp";
import property2 from "@/assets/property-2.webp";
import property3 from "@/assets/property-3.webp";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SiteContentData {
  hero: {
    title: string;
    subtitle: string;
    mainImage: string;
    mainVideo?: string;
    statsNumber: string;
    statsLabel: string;
    cardImage: string;
    cardText: string;
  };
  proximo_hogar: {
    title: string;
    subtitle: string;
    properties: Array<{ name: string; price: string; area: string; img: string; link?: string }>;
  };
  apartamentos: {
    title: string;
    subtitle: string;
    models: Array<{
      id: string;
      name: string;
      area: string;
      bedrooms: string;
      bathrooms: string;
      balcony: string;
      parking?: string;
      distribution: string[];
      specs?: Array<{ label: string; value: string }>;
      plan: string;
      render: string;
      gallery?: string[];
      financingTotal?: string;
      financingInicial?: string;
      financingCuotasMonto?: string;
      financingCuotasNro?: string;
      financingCuotaUnica?: string;
    }>;
  };
  areas: {
    title: string;
    subtitle: string;
    list: Array<{
      id: string;
      name: string;
      description: string;
      img: string;
    }>;
  };
  contacto: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
  };
  comercial: {
    hero: {
      title: string;
      subtitle: string;
      mainImage: string;
      video?: string;
      statsNumber: string;
      statsLabel: string;
    };
    proyecto: {
      title: string;
      subtitle: string;
      desc1: string;
      desc2: string;
      image: string;
      video?: string;
      bullets?: Array<{ text: string }>;
    };
    stats: Array<{ valor: string; unidad: string; label: string }>;
    ventajas: Array<{ num: string; titulo: string; desc: string }>;
    locales: Array<{
      id: string;
      nombre: string;
      categoria: string;
      desc: string;
      area: string;
      status: string;
      img: string;
    }>;
    distribucion: {
      titulo: string;
      subtitulo: string;
      showSubtotals?: boolean;
      statsGrid: Array<{ value: string; unit?: string; label: string }>;
      plantaBaja: {
        label: string;
        rangLabel: string;
        items: Array<{ name: string; area: string }>;
        subtotal: string;
        planoImg?: string;
      };
      plantaAlta: {
        label: string;
        rangLabel: string;
        items: Array<{ name: string; area: string }>;
        subtotal: string;
        planoImg?: string;
      };
    };
    socials?: {
      instagram?: string;
      facebook?: string;
    };
  };
  faq: {
    title: string;
    items: Array<{ q: string; a: string }>;
  };
  settings?: {
    aiEnabled: boolean;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContentData = {
  hero: {
    title: "HOGARES QUE\nTE INSPIRAN",
    subtitle: "Traemos estilo, serenidad y lujo a través de arquitectura inteligente en el corazón de Nueva Guayana.",
    mainImage: heroBuilding,
    mainVideo: "",
    statsNumber: "50+",
    statsLabel: "Especialistas dedicados a un vivir sostenible",
    cardImage: property3,
    cardText: "Encuentra el hogar que se ajusta a tu estilo",
  },
  proximo_hogar: {
    title: "¿Y si tu próximo hogar\nya te estuviera esperando?",
    subtitle: "Explora apartamentos completamente curados — cuidadosamente seleccionados, listas cuando tú lo estés.",
    properties: [
      { name: "PENTHOUSE BUCARE", price: "$524,000", area: "$6,390/m²", img: property1, link: "/apartamentos" },
      { name: "VISTA CORDILLERA", price: "", area: "", img: property2, link: "/apartamentos" },
      { name: "SUITE MIRADOR", price: "", area: "", img: property3, link: "/contacto" },
    ],
  },
  apartamentos: {
    title: "Seis formas\nde vivir Bucare",
    subtitle: "Cada modelo está pensado para un ritmo de vida distinto. Selecciona una tipología para conocer su plano y ver cómo se materializa.",
    models: [
      {
        id: "01", name: "MODELO 01", area: "31.60 m²", bedrooms: "1 hab.", bathrooms: "1 baño", balcony: "Jardinera / Balcón frontal", parking: "1 puesto de estacionamiento",
        specs: [{label:"Área",value:"31.60 m²"},{label:"Estacionamiento",value:"1 puesto"},{label:"Habitaciones",value:"1 hab."},{label:"Baños",value:"1 baño"},{label:"Balcón",value:"Jardinera / Balcón frontal"}],
        distribution: ["Acceso / Ingreso central.", "Baño completo accesible cerca de la entrada.", "Área integradora de comedor y cocina lineal.", "Habitación principal integrada con vista y salida hacia el balcón/jardinera."],
        plan: "/modelos/mapa_modelo01.jpg", render: "/modelos/Imagen_modelo01.jpg",
        gallery: ["/modelos/Imagen_modelo01.jpg", "/modelos/mapa_modelo01.jpg", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop&q=80"],
        financingTotal: "43.895", financingInicial: "15.365", financingCuotasMonto: "2.195", financingCuotasNro: "12", financingCuotaUnica: "5.000"
      },
      {
        id: "02", name: "MODELO 02", area: "45.03 m²", bedrooms: "1 hab.", bathrooms: "1 baño", balcony: "Balcón / Área verde frontal", parking: "1 puesto de estacionamiento",
        specs: [{label:"Área",value:"45.03 m²"},{label:"Estacionamiento",value:"1 puesto"},{label:"Habitaciones",value:"1 hab."},{label:"Baños",value:"1 baño"},{label:"Balcón",value:"Balcón / Área verde frontal"}],
        distribution: ["Acceso / Ingreso con área de recibidor.", "Baño completo.", "Cocina en L / Comedor auxiliar circular.", "Zona de trabajo o escritorio.", "Habitación espaciosa con salida a balcón con jardines."],
        plan: "/modelos/mapa_modelo02.jpg", render: "/modelos/Imagen_modelo02.jpg",
        gallery: ["/modelos/Imagen_modelo02.jpg", "/modelos/mapa_modelo02.jpg", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80"],
        financingTotal: "61.640", financingInicial: "21.575", financingCuotasMonto: "3.275", financingCuotasNro: "12", financingCuotaUnica: "5.000"
      },
      {
        id: "03", name: "MODELO 03", area: "56.70 m²", bedrooms: "2 hab.", bathrooms: "2 baños", balcony: "Balcón", parking: "1 puesto de estacionamiento",
        specs: [{label:"Área",value:"56.70 m²"},{label:"Estacionamiento",value:"1 puesto"},{label:"Habitaciones",value:"2 hab."},{label:"Baños",value:"2 baños"},{label:"Balcón",value:"Balcón"}],
        distribution: ["Ingreso a la zona social (sala de estar).", "Cocina abierta integrada con barra/comedor.", "2 habitaciones (habitación principal con baño privado y habitación secundaria).", "2 baños completos.", "Balcón continuo en la fachada posterior/lateral."],
        plan: "/modelos/mapa_modelo03.jpg", render: "/modelos/Imagen_modelo03.jpg",
        gallery: ["/modelos/Imagen_modelo03.jpg", "/modelos/mapa_modelo03.jpg", "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1617806118233-18e1db207faf?w=800&auto=format&fit=crop&q=80"],
        financingTotal: "79.845", financingInicial: "27.945", financingCuotasMonto: "4.380", financingCuotasNro: "12", financingCuotaUnica: "5.000"
      },
      {
        id: "04", name: "MODELO 04", area: "63.23 m²", bedrooms: "2 hab.", bathrooms: "2 baños", balcony: "Balcón", parking: "1 puesto de estacionamiento",
        specs: [{label:"Área",value:"63.23 m²"},{label:"Estacionamiento",value:"1 puesto"},{label:"Habitaciones",value:"2 hab."},{label:"Baños",value:"2 baños"},{label:"Balcón",value:"Balcón"}],
        distribution: ["Ingreso con recibidor.", "Cocina amplia integrada a comedor central.", "Sala de estar acogedora.", "Habitación principal de gran tamaño y habitación secundaria.", "2 baños completos.", "Balcón."],
        plan: "/modelos/mapa_modelo04.jpg", render: "/modelos/Imagen_modelo04.jpg",
        gallery: ["/modelos/Imagen_modelo04.jpg", "/modelos/mapa_modelo04.jpg", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&auto=format&fit=crop&q=80"],
        financingTotal: "88.015", financingInicial: "30.805", financingCuotasMonto: "4.875", financingCuotasNro: "12", financingCuotaUnica: "5.000"
      },
      {
        id: "05", name: "MODELO 05", area: "73.88 m²", bedrooms: "2 hab.", bathrooms: "2 baños", balcony: "Balcones amplios", parking: "1 puesto de estacionamiento",
        specs: [{label:"Área",value:"73.88 m²"},{label:"Estacionamiento",value:"1 puesto"},{label:"Habitaciones",value:"2 hab."},{label:"Baños",value:"2 baños"},{label:"Balcón",value:"Balcones amplios"}],
        distribution: ["Acceso con área de cocina en isla / barra desayunadora y área de servicios.", "Sala de estar amplia con salida directa a amplio balcón con vegetación.", "2 habitaciones de excelente tamaño.", "2 baños completos.", "Balcones extensos con jardineras."],
        plan: "/modelos/mapa_modelo05.jpg", render: "/modelos/Imagen_modelo05.jpg",
        gallery: ["/modelos/Imagen_modelo05.jpg", "/modelos/mapa_modelo05.jpg", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&auto=format&fit=crop&q=80"],
        financingTotal: "101.170", financingInicial: "35.410", financingCuotasMonto: "5.670", financingCuotasNro: "12", financingCuotaUnica: "5.000"
      },
      {
        id: "06", name: "MODELO 06", area: "86.91 m²", bedrooms: "3 hab.", bathrooms: "2 baños", balcony: "Balcones", parking: "2 puestos de estacionamiento",
        specs: [{label:"Área",value:"86.91 m²"},{label:"Estacionamiento",value:"2 puestos"},{label:"Habitaciones",value:"3 hab."},{label:"Baños",value:"2 baños"},{label:"Balcón",value:"Balcones"}],
        distribution: ["Es el modelo de mayor área del edificio.", "Acceso/Ingreso directo a área social con sala y amplio comedor.", "Cocina moderna en L integrando la zona social.", "3 habitaciones (habitación principal con baño suite y 2 habitaciones secundarias/estudio).", "2 baños completos.", "Múltiples balcón/jardineras que bordean los espacios principales."],
        plan: "/modelos/mapa_modelo06.jpg", render: "/modelos/Imagen_modelo06.jpg",
        gallery: ["/modelos/Imagen_modelo06.jpg", "/modelos/mapa_modelo06.jpg", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80"],
        financingTotal: "118.980", financingInicial: "41.645", financingCuotasMonto: "6.750", financingCuotasNro: "12", financingCuotaUnica: "5.000"
      },
    ]
  },
  areas: {
    title: "Vida más allá\nde tu apartamento",
    subtitle: "Seis ambientes diseñados para trabajar, descansar, conectar y disfrutar sin salir de Bucare Suite.",
    list: [
      { id: "coworking", name: "Coworking", description: "Espacio de trabajo compartido con iluminación natural, conectividad de alta velocidad y cabinas para videollamadas.", img: "/areas/coworking.webp" },
      { id: "plaza", name: "Plaza Central", description: "Plaza paisajística con vegetación local, bancas y zonas de descanso al aire libre.", img: "/areas/plaza.webp" },
      { id: "lobby", name: "Lobby Principal", description: "Recepción de doble altura con acabados en piedra, madera y iluminación cálida de bienvenida.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600" },
      { id: "entrada", name: "Acceso & Entrada", description: "Acceso peatonal y vehicular con porte cochere, control de acceso y seguridad las 24 horas.", img: "/areas/entrada.webp" },
      { id: "gym", name: "Gimnasio Equipado", description: "Gimnasio equipado con máquinas de cardio, pesas libres y zona funcional para entrenamiento completo.", img: "/areas/gym.webp" },
      { id: "terraza", name: "Terraza Social", description: "Rooftop con vistas a la ciudad, zona de lounge, barra gourmet y espacio para eventos sociales.", img: "/areas/terraza-social.webp" },
    ]
  },
  contacto: {
    title: "Hablemos\nde tu próximo\nhogar",
    subtitle: "Nuestro equipo te atiende de lunes a sábado. Responde este formulario y agendaremos una visita privada al edificio o una llamada.",
    address: "QQJC+93C San Cristóbal 5001\nNueva Guayana, Venezuela",
    phone: "+58 (276) 000-0000 / 0424 283 1342",
    email: "hola@bucaresuite.com",
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
    distribucion: {
      titulo: "Planificación espacial\ninteligente y optimizada.",
      subtitulo: "02 Distribución de Áreas",
      showSubtotals: true,
      statsGrid: [
        { value: "10",     label: "Locales Comerciales (5 PB / 5 PA)" },
        { value: "381.68", unit: "m²", label: "Área Útil Comercial" },
        { value: "433.69", unit: "m²", label: "Superficie Construida Total" },
      ],
      plantaBaja: {
        label: "Planta Baja",
        rangLabel: "Locales del 1 al 5",
        items: [
          { name: "Local 1", area: "27.88 m²" },
          { name: "Local 2", area: "31.92 m²" },
          { name: "Local 3", area: "20.71 m²" },
          { name: "Local 4", area: "20.71 m²" },
          { name: "Local 5", area: "43.23 m²" },
          { name: "Local 4", area: "57.37 m²" },
          { name: "Local 5", area: "69.40 m²" },
        ],
        subtotal: "207.28 m²",
        planoImg: "/comercial/plano_pb.jpg",
      },
      plantaAlta: {
        label: "Planta Alta",
        rangLabel: "Locales del 6 al 10",
        items: [
          { name: "Local 6", area: "36.70 m²" },
          { name: "Local 7", area: "31.92 m²" },
          { name: "Local 8", area: "20.71 m²" },
          { name: "Local 9", area: "20.71 m²" },
          { name: "Local 10", area: "64.36 m²" },
        ],
        subtotal: "174.40 m²",
        planoImg: "/comercial/plano_pa.jpg",
      },
    },
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
  settings: {
    aiEnabled: true,
  }
};

// ── Context ───────────────────────────────────────────────────────────────────

interface SiteContentContextValue {
  content: SiteContentData;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

// ── Parser (merge DB data over defaults) ──────────────────────────────────────

function mergeContent(prev: SiteContentData, json: any): SiteContentData {
  const h   = json.hero          || {};
  const p   = json.proximo_hogar || {};
  const r   = json.apartamentos  || {};
  const a   = json.areas         || {};
  const c   = json.contacto      || {};
  const com = json.comercial     || {};
  const f   = json.faq           || {};
  const s   = json.settings      || {};

  return {
    hero: {
      ...prev.hero,
      ...h,
      mainImage: h.mainImage || prev.hero.mainImage,
      mainVideo: h.mainVideo !== undefined ? h.mainVideo : prev.hero.mainVideo,
      cardImage: h.cardImage || prev.hero.cardImage,
    },
    proximo_hogar: {
      ...prev.proximo_hogar,
      ...p,
      properties: (p.properties && p.properties.length > 0)
        ? p.properties.map((prop: any, idx: number) => ({
            name:  prop.name  !== undefined ? prop.name  : (prev.proximo_hogar.properties[idx]?.name  ?? ""),
            price: prop.price !== undefined ? prop.price : (prev.proximo_hogar.properties[idx]?.price ?? ""),
            area:  prop.area  !== undefined ? prop.area  : (prev.proximo_hogar.properties[idx]?.area  ?? ""),
            link:  prop.link  !== undefined ? prop.link  : (prev.proximo_hogar.properties[idx]?.link  ?? ""),
            img:   prop.img   !== undefined ? prop.img   : (prev.proximo_hogar.properties[idx]?.img   ?? ""),
          }))
        : prev.proximo_hogar.properties,
    },
    apartamentos: {
      ...prev.apartamentos,
      ...r,
      models: (r.models && r.models.length > 0)
        ? r.models.map((mod: any, idx: number) => ({
            ...mod,
            render: mod.render || prev.apartamentos.models[idx]?.render,
            plan:   mod.plan   || prev.apartamentos.models[idx]?.plan,
            gallery: mod.gallery && Array.isArray(mod.gallery) && mod.gallery.length > 0
              ? mod.gallery
              : prev.apartamentos.models[idx]?.gallery || [mod.render, mod.plan].filter(Boolean),
            specs: mod.specs && mod.specs.length > 0 ? mod.specs : prev.apartamentos.models[idx]?.specs,
            financingTotal: mod.financingTotal !== undefined ? mod.financingTotal : prev.apartamentos.models[idx]?.financingTotal,
            financingInicial: mod.financingInicial !== undefined ? mod.financingInicial : prev.apartamentos.models[idx]?.financingInicial,
            financingCuotasMonto: mod.financingCuotasMonto !== undefined ? mod.financingCuotasMonto : prev.apartamentos.models[idx]?.financingCuotasMonto,
            financingCuotasNro: mod.financingCuotasNro !== undefined ? mod.financingCuotasNro : prev.apartamentos.models[idx]?.financingCuotasNro,
            financingCuotaUnica: mod.financingCuotaUnica !== undefined ? mod.financingCuotaUnica : prev.apartamentos.models[idx]?.financingCuotaUnica,
          }))
        : prev.apartamentos.models,
    },
    areas: {
      ...prev.areas,
      ...a,
      list: (a.list && a.list.length > 0)
        ? a.list.map((item: any, idx: number) => ({
            ...item,
            img: item.img || prev.areas.list[idx]?.img,
          }))
        : prev.areas.list,
    },
    contacto: {
      ...prev.contacto,
      ...c,
    },
    comercial: {
      hero: {
        ...prev.comercial.hero,
        ...(com.hero || {}),
        video: com.hero?.video !== undefined ? com.hero.video : prev.comercial.hero.video,
      },
      proyecto: {
        ...prev.comercial.proyecto,
        ...(com.proyecto || {}),
        video: com.proyecto?.video !== undefined ? com.proyecto.video : prev.comercial.proyecto.video,
        bullets: (com.proyecto?.bullets && com.proyecto.bullets.length > 0)
          ? com.proyecto.bullets
          : prev.comercial.proyecto.bullets,
      },
      stats: (com.stats && com.stats.length > 0)
        ? com.stats.map((st: any, idx: number) => ({
            valor:  st.valor  || prev.comercial.stats[idx]?.valor  || "",
            unidad: st.unidad !== undefined ? st.unidad : (prev.comercial.stats[idx]?.unidad || ""),
            label:  st.label  || prev.comercial.stats[idx]?.label  || "",
          }))
        : prev.comercial.stats,
      ventajas: (com.ventajas && com.ventajas.length > 0)
        ? com.ventajas.map((vent: any, idx: number) => ({
            num:    vent.num    || prev.comercial.ventajas[idx]?.num    || "",
            titulo: vent.titulo || prev.comercial.ventajas[idx]?.titulo || "",
            desc:   vent.desc   || prev.comercial.ventajas[idx]?.desc   || "",
          }))
        : prev.comercial.ventajas,
      locales: (com.locales && com.locales.length > 0)
        ? com.locales.map((loc: any, idx: number) => ({
            id:        loc.id        || prev.comercial.locales[idx]?.id        || "",
            nombre:    loc.nombre    || prev.comercial.locales[idx]?.nombre    || "",
            categoria: loc.categoria || prev.comercial.locales[idx]?.categoria || "",
            desc:      loc.desc      || prev.comercial.locales[idx]?.desc      || "",
            area:      loc.area      || prev.comercial.locales[idx]?.area      || "",
            status:    loc.status    || prev.comercial.locales[idx]?.status    || "",
            img:       loc.img       || prev.comercial.locales[idx]?.img       || "",
          }))
        : prev.comercial.locales,
      distribucion: com.distribucion
        ? {
            titulo:    com.distribucion.titulo    || prev.comercial.distribucion.titulo,
            subtitulo: com.distribucion.subtitulo || prev.comercial.distribucion.subtitulo,
            showSubtotals: com.distribucion.showSubtotals !== undefined ? com.distribucion.showSubtotals : (prev.comercial.distribucion.showSubtotals !== undefined ? prev.comercial.distribucion.showSubtotals : true),
            statsGrid: (com.distribucion.statsGrid && com.distribucion.statsGrid.length > 0)
              ? com.distribucion.statsGrid.map((st: any, idx: number) => ({
                  value: st.value || prev.comercial.distribucion.statsGrid[idx]?.value || "",
                  unit:  st.unit  !== undefined ? st.unit : prev.comercial.distribucion.statsGrid[idx]?.unit,
                  label: st.label || prev.comercial.distribucion.statsGrid[idx]?.label || "",
                }))
              : prev.comercial.distribucion.statsGrid,
            plantaBaja: {
              label:     com.distribucion.plantaBaja?.label     || prev.comercial.distribucion.plantaBaja.label,
              rangLabel: com.distribucion.plantaBaja?.rangLabel || prev.comercial.distribucion.plantaBaja.rangLabel,
              items: (com.distribucion.plantaBaja?.items && com.distribucion.plantaBaja.items.length > 0)
                ? com.distribucion.plantaBaja.items.map((it: any, idx: number) => ({
                    name: it.name || prev.comercial.distribucion.plantaBaja.items[idx]?.name || "",
                    area: it.area || prev.comercial.distribucion.plantaBaja.items[idx]?.area || "",
                  }))
                : prev.comercial.distribucion.plantaBaja.items,
              subtotal: com.distribucion.plantaBaja?.subtotal || prev.comercial.distribucion.plantaBaja.subtotal,
              planoImg: com.distribucion.plantaBaja?.planoImg || prev.comercial.distribucion.plantaBaja.planoImg || "/comercial/plano_pb.jpg",
            },
            plantaAlta: {
              label:     com.distribucion.plantaAlta?.label     || prev.comercial.distribucion.plantaAlta.label,
              rangLabel: com.distribucion.plantaAlta?.rangLabel || prev.comercial.distribucion.plantaAlta.rangLabel,
              items: (com.distribucion.plantaAlta?.items && com.distribucion.plantaAlta.items.length > 0)
                ? com.distribucion.plantaAlta.items.map((it: any, idx: number) => ({
                    name: it.name || prev.comercial.distribucion.plantaAlta.items[idx]?.name || "",
                    area: it.area || prev.comercial.distribucion.plantaAlta.items[idx]?.area || "",
                  }))
                : prev.comercial.distribucion.plantaAlta.items,
              subtotal: com.distribucion.plantaAlta?.subtotal || prev.comercial.distribucion.plantaAlta.subtotal,
              planoImg: com.distribucion.plantaAlta?.planoImg || prev.comercial.distribucion.plantaAlta.planoImg || "/comercial/plano_pa.jpg",
            },
          }
        : prev.comercial.distribucion,
      socials: {
        instagram: com.socials?.instagram || prev.comercial.socials?.instagram || "",
        facebook:  com.socials?.facebook  || prev.comercial.socials?.facebook  || "",
      },
    },
    faq: {
      title: f.title !== undefined ? f.title : (prev.faq?.title || "Todo lo que necesitas\nsaber antes de encontrar\ntu próximo hogar"),
      items: (f.items && Array.isArray(f.items) && f.items.length > 0)
        ? f.items.map((item: any, idx: number) => ({
            q: item.q !== undefined ? item.q : (prev.faq?.items[idx]?.q ?? ""),
            a: item.a !== undefined ? item.a : (prev.faq?.items[idx]?.a ?? ""),
          }))
        : (prev.faq?.items || []),
    },
    settings: {
      aiEnabled: s.aiEnabled !== undefined ? s.aiEnabled : true,
    },
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentData>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/site-content?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setContent((prev) => mergeContent(prev, json.data));
        }
      }
    } catch (e) {
      console.warn("Could not fetch dynamic site content, falling back to local defaults.", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <SiteContentContext.Provider value={{ content, loading, refetch: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

// ── Consumer hooks ────────────────────────────────────────────────────────────

/**
 * Consume el contenido del sitio desde el Context global.
 * Debe usarse dentro de <SiteContentProvider>.
 */
export function useSiteContentContext(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContentContext must be used within a SiteContentProvider");
  }
  return ctx;
}
