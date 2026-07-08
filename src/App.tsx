import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, ChevronRight, X, Trash2, Utensils, Facebook, MapPin, Loader2, Gift, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSheetData, submitSheetData, SheetDish, SheetCategory, SHEET_ID } from './services/googleSheets';
import { DEFAULT_MENU_DATA } from './data/menuData';

// ==========================================
// 📋 CONFIGURACIÓN DE LA PLANTILLA DEL MENÚ
// ==========================================
const RESTAURANTE_NAME = "Leña y Brasas";
const RESTAURANTE_SLOGAN = "Pollos a la brasa, broaster y platos criollos al momento";
const WHATSAPP_NUMBER = ""; // Reemplaza con tu número de WhatsApp con código de país (ej: 51 para Perú)
const FACEBOOK_URL = "";
const MAPS_URL = "";
const LOGO_FOOTER_PATH = "/logo.png"; // Reemplaza con la ruta de tu logo en public/ (ej: /logo.png)
const BANNER_PATH = "/banner.png"; // Reemplaza con la ruta de tu banner en public/ (ej: /banner.png)
const MARQUEE_TEXT = "🔥 POLLO A LA BRASA • PAPAS CROCANTES • SABOR CRIOLLO • BROASTER Y SALTADOS AL MOMENTO 🔥 ";
// ==========================================

// Mapa de imágenes locales por defecto para platos conocidos (vacío por defecto para la plantilla)
const LOCAL_IMAGES: Record<string, string> = {
  // "Nombre del Plato": "nombre_imagen.jpg",
};

interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
}

interface Category {
  id: string;
  nombre: string;
  items: Dish[];
}

interface CartItem {
  nombre: string;
  precio: string;
  cantidad: number;
  opcion?: string;
  cremas?: string[];
  nota?: string;
}

const isQuarterChicken = (name: string): boolean => {
  const normalized = name.toLowerCase();
  return (normalized.includes("1/4") || normalized.includes("un cuarto")) && 
         normalized.includes("pollo") && 
         normalized.includes("brasa");
};

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // States for customization
  const [selectedCustomizationDish, setSelectedCustomizationDish] = useState<Dish | null>(null);
  const [customizationOptions, setCustomizationOptions] = useState<{
    opcion: string;
    cremas: string[];
    nota: string;
  }>({
    opcion: "con papas fritas y ensalada clásica",
    cremas: [],
    nota: ""
  });

  // States for Birthday Form
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);
  const [isSubmittingBirthday, setIsSubmittingBirthday] = useState(false);
  const [birthdaySuccess, setBirthdaySuccess] = useState(false);
  const [birthdayData, setBirthdayData] = useState({
    nombre: '',
    telefono: '',
    fechaNacimiento: '',
    distrito: '',
    correo: ''
  });

  // States for Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewData, setReviewData] = useState({
    estrellasMozo: 0,
    estrellasComida: 0,
    comentario: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!SHEET_ID) {
          setCategories(DEFAULT_MENU_DATA);
          if (DEFAULT_MENU_DATA.length > 0) {
            setActiveCategory(DEFAULT_MENU_DATA[0].id);
          }
          return;
        }

        const [cats, dishes] = await Promise.all([
          fetchSheetData<SheetCategory>('Categorías'),
          fetchSheetData<SheetDish>('Platos')
        ]);

        if (cats.length === 0 && dishes.length === 0) {
          setCategories(DEFAULT_MENU_DATA);
          if (DEFAULT_MENU_DATA.length > 0) {
            setActiveCategory(DEFAULT_MENU_DATA[0].id);
          }
          return;
        }

        const formattedCategories: Category[] = cats.map(c => ({
          id: c.nombre.toLowerCase().replace(/\s+/g, '-'),
          nombre: c.nombre,
          items: dishes
            .filter(d => d.categoría === c.nombre)
            .map(d => ({
              nombre: d['nombre del plato'],
              descripcion: d.descripción,
              precio: d.precio,
              imagen: LOCAL_IMAGES[d['nombre del plato']] || d['URL de imagen'] || null
            }))
        }));

        setCategories(formattedCategories);
        if (formattedCategories.length > 0) {
          setActiveCategory(formattedCategories[0].id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setCategories(DEFAULT_MENU_DATA);
        if (DEFAULT_MENU_DATA.length > 0) {
          setActiveCategory(DEFAULT_MENU_DATA[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.cantidad, 0), [cart]);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.nombre === dish.nombre && i.precio === dish.precio && !i.opcion);
      if (existing) {
        return prev.map(i =>
          (i.nombre === dish.nombre && i.precio === dish.precio && !i.opcion)
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { nombre: dish.nombre, precio: dish.precio, cantidad: 1 }];
    });
  };

  const addCustomizedToCart = (dish: Dish, opcion: string, cremas: string[], nota: string) => {
    setCart(prev => {
      const existing = prev.find(i => 
        i.nombre === dish.nombre && 
        i.precio === dish.precio &&
        i.opcion === opcion &&
        JSON.stringify(i.cremas) === JSON.stringify(cremas) &&
        i.nota === nota
      );
      if (existing) {
        return prev.map(i =>
          (i.nombre === dish.nombre && 
           i.precio === dish.precio &&
           i.opcion === opcion &&
           JSON.stringify(i.cremas) === JSON.stringify(cremas) &&
           i.nota === nota)
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { 
        nombre: dish.nombre, 
        precio: dish.precio, 
        cantidad: 1, 
        opcion, 
        cremas, 
        nota 
      }];
    });
  };

  const updateQuantity = (
    nombre: string,
    precio: string,
    delta: number,
    opcion?: string,
    cremas?: string[],
    nota?: string
  ) => {
    setCart(prev =>
      prev
        .map(i => {
          if (
            i.nombre === nombre &&
            i.precio === precio &&
            i.opcion === opcion &&
            JSON.stringify(i.cremas) === JSON.stringify(cremas) &&
            i.nota === nota
          ) {
            const newQty = i.cantidad + delta;
            return newQty > 0 ? { ...i, cantidad: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const cleanPrice = item.precio.replace(/^[^\d]*/, '');
      const num = parseFloat(cleanPrice) || 0;
      return acc + num * item.cantidad;
    }, 0);
  };

  const sendToWhatsApp = () => {
    const total = calculateTotal();
    let message = `*Hola ${RESTAURANTE_NAME}, deseo realizar un pedido:*\n\n`;
    cart.forEach(item => {
      let itemDetails = `• ${item.cantidad} x ${item.nombre}`;
      if (item.opcion) {
        itemDetails += `\n  - ${item.opcion}`;
      }
      if (item.cremas && item.cremas.length > 0) {
        itemDetails += `\n  - Cremas: ${item.cremas.join(', ')}`;
      }
      if (item.nota) {
        itemDetails += `\n  - Nota: ${item.nota}`;
      }
      itemDetails += ` (${item.precio})\n`;
      message += itemDetails;
    });
    message += `\n*TOTAL: S/.${total.toFixed(2)}*`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBirthdaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBirthday(true);
    const success = await submitSheetData('Cumpleaños', {
      timestamp: new Date().toLocaleString('es-PE'),
      nombre: birthdayData.nombre,
      telefono: birthdayData.telefono,
      fechaNacimiento: birthdayData.fechaNacimiento,
      distrito: birthdayData.distrito,
      correo: birthdayData.correo || 'No indicado'
    });
    
    setIsSubmittingBirthday(false);
    if (success) {
      setBirthdaySuccess(true);
      setTimeout(() => {
        setShowBirthdayForm(false);
        setBirthdaySuccess(false);
        setBirthdayData({ nombre: '', telefono: '', fechaNacimiento: '', distrito: '', correo: '' });
      }, 3000);
    } else {
      alert("Hubo un error al enviar tus datos. Por favor, inténtalo de nuevo.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewData.estrellasMozo === 0 || reviewData.estrellasComida === 0) {
      alert("Por favor califica ambas opciones con estrellas.");
      return;
    }

    setIsSubmittingReview(true);
    const success = await submitSheetData('Reseñas', {
      timestamp: new Date().toLocaleString('es-PE'),
      estrellasMozo: reviewData.estrellasMozo,
      estrellasComida: reviewData.estrellasComida,
      comentario: reviewData.comentario || 'Sin comentarios'
    });
    
    setIsSubmittingReview(false);
    if (success) {
      setReviewSuccess(true);
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccess(false);
        setReviewData({ estrellasMozo: 0, estrellasComida: 0, comentario: '' });
      }, 3000);
    } else {
      alert("Hubo un error al enviar tu reseña. Por favor, inténtalo de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-slogan text-primary font-bold tracking-widest uppercase text-xs">Cargando delicias...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col font-sans">
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 px-5 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex flex-col items-start">
          <h1 className="font-title text-[28px] text-primary leading-none tracking-wide">{RESTAURANTE_NAME}</h1>
          <span className="font-slogan text-[11px] text-secondary font-bold tracking-wider mt-0.5">{RESTAURANTE_SLOGAN}</span>
        </div>
        <div className="flex items-center gap-2">
          {FACEBOOK_URL && (
            <motion.a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary cursor-pointer"
            >
              <Facebook size={22} />
            </motion.a>
          )}
          {MAPS_URL && (
            <motion.a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary cursor-pointer"
            >
              <MapPin size={22} />
            </motion.a>
          )}
          <motion.div
            onClick={() => cartCount > 0 && setShowSummary(true)}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center relative cursor-pointer"
          >
            <ShoppingBag size={22} className="text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-secondary text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </motion.div>
        </div>
      </header>

      <div className="w-full bg-primary py-2 overflow-hidden flex items-center">
        <div className="animate-marquee flex gap-6 text-white font-slogan font-bold text-[11px] tracking-widest uppercase whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i}>{MARQUEE_TEXT}</span>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: ["0px 0px 0px 0px rgba(245,158,11,0.6)", "0px 0px 20px 8px rgba(245,158,11,0)", "0px 0px 0px 0px rgba(245,158,11,0)"] 
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => setShowBirthdayForm(true)}
          className="w-full bg-gradient-to-r from-yellow-500 via-secondary to-amber-500 text-white py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] sm:text-[11px] uppercase tracking-wide border border-yellow-400 relative overflow-hidden group text-center"
        >
          <div className="absolute inset-0 shimmer opacity-30 mix-blend-overlay"></div>
          <Gift size={18} className="animate-bounce shrink-0" />
          <span>¡Registra tu cumpleaños y celebra con sabor a brasa! 🎁🔥 <span className="text-yellow-100 font-black underline">Regístrate aquí</span></span>
        </motion.button>
      </div>

      <div className="px-5 pt-4 pb-3">
        {BANNER_PATH ? (
          <div className="relative w-full rounded-3xl overflow-hidden shadow-xl aspect-[2/1] bg-gray-50 border border-gray-100">
            <img src={BANNER_PATH} alt="Banner Restaurante" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="relative w-full rounded-3xl overflow-hidden shadow-xl aspect-[2/1] bg-gradient-to-br from-primary/10 to-secondary/15 flex flex-col items-center justify-center text-center p-4 border border-dashed border-primary/20">
            <p className="font-dish font-bold text-primary text-sm uppercase tracking-wider">
              aca va a imagen
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-[11px] font-category font-semibold whitespace-nowrap transition-all duration-200 border
                ${activeCategory === cat.id
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-white text-dark border-gray-200 hover:border-primary/40 hover:text-primary'
                }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-32 px-5">
        {categories.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`} className="mb-10 scroll-mt-28">
            <div className="mb-5 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Utensils className="text-primary wave-icon" size={22} />
                <h3 className="font-category font-semibold text-primary text-[26px] leading-none tracking-wide category-underline">
                  {cat.nombre}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {cat.items.map((dish, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="bg-primary/5 aspect-square flex items-center justify-center relative overflow-hidden border-b border-gray-100 cursor-pointer">
                    {dish.imagen ? (
                      <img 
                        src={dish.imagen} 
                        alt={dish.nombre} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onClick={() => setSelectedImage(dish.imagen || null)}
                      />
                    ) : (
                      <span className="font-dish font-bold text-[13px] text-primary uppercase tracking-wider text-center p-4">
                        🔥 {dish.nombre.toLowerCase().includes("pollo") ? "🍗" : "🥩"}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-dish font-bold text-dark text-[13px] leading-tight mb-1">
                      {dish.nombre}
                    </h4>
                    {dish.descripcion && (
                      <p className="text-[10px] text-gray-400 leading-tight mb-2 line-clamp-3">
                        {dish.descripcion}
                      </p>
                    )}
                    <div className="flex-1"></div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-dish font-bold text-primary text-[16px] whitespace-nowrap">
                        {dish.precio}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => {
                          if (isQuarterChicken(dish.nombre)) {
                            setSelectedCustomizationDish(dish);
                            setCustomizationOptions({
                              opcion: "con papas fritas y ensalada clásica",
                              cremas: [],
                              nota: ""
                            });
                          } else {
                            addToCart(dish);
                          }
                        }}
                        className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary transition-colors duration-200 shrink-0"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-8 mb-4 border border-gray-100 bg-gray-50 rounded-3xl p-5 text-center shadow-sm">
          <h3 className="font-title text-primary text-[22px] leading-tight mb-2">¿Cómo estuvo todo?</h3>
          <p className="text-[11px] text-gray-500 mb-4 px-4">Ayúdanos a mejorar calificando tu experiencia con nosotros</p>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReviewForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 mx-auto w-full"
          >
            <Star size={18} className="fill-white" />
            Reseña nuestra comida
          </motion.button>
        </section>

        <footer className="mt-8 pt-8 pb-10 border-t border-gray-200 flex flex-col items-center justify-center">
          <p className="font-title text-2xl text-primary mb-4">{RESTAURANTE_NAME}</p>
          {LOGO_FOOTER_PATH ? (
            <div className="w-32 h-32 mb-6 rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center shadow-sm">
              <img src={LOGO_FOOTER_PATH} alt="Logo Restaurante" className="w-full h-full object-contain p-2" />
            </div>
          ) : (
            <div className="w-32 h-32 mb-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex items-center justify-center text-center p-2">
              <span className="font-dish font-bold text-[10px] text-primary uppercase tracking-wide">aca va a imagen</span>
            </div>
          )}
          <p className="text-[11px] text-gray-400 font-medium">© 2026 Todos los derechos reservados.</p>
        </footer>

        <div className="bg-dark py-6 flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 opacity-50 text-white/50">Digital Menu Experience</p>
          <motion.a 
            href="https://tymasolutions.lat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold text-sm tracking-tight group cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white group-hover:text-[#00BFFF] transition-colors duration-200">Hecho por Tyma</span>
            <span className="text-[#00BFFF] group-hover:text-white transition-colors duration-200">Solutions</span>
          </motion.a>
        </div>
      </main>

      <AnimatePresence>
        {cartCount > 0 && !showSummary && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 w-full max-w-md p-5 z-40"
          >
            <div className="glass rounded-[2rem] p-4 flex items-center justify-between border border-white/50 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="shimmer absolute inset-0 opacity-20"></div>
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tu Pedido</p>
                  <p className="font-bold text-dark text-lg">{cartCount} Artículos</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummary(true)}
                className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/30 font-bold text-sm"
              >
                Ver Pedido
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 lg:p-0"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[3rem] p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-title text-2xl text-primary">Mi Pedido</h2>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-3 mb-8">
                {cart.map(item => {
                  const itemKey = `${item.nombre}-${item.precio}-${item.opcion || ''}-${(item.cremas || []).join(',')}-${item.nota || ''}`;
                  return (
                    <div
                      key={itemKey}
                      className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl animate-fade-in"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-dish font-semibold text-dark text-sm truncate">{item.nombre}</h4>
                        {item.opcion && (
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                            Acompañamiento: <span className="text-secondary font-semibold">{item.opcion}</span>
                          </p>
                        )}
                        {item.cremas && item.cremas.length > 0 && (
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                            Cremas: <span className="text-primary font-semibold">{item.cremas.join(', ')}</span>
                          </p>
                        )}
                        {item.nota && (
                          <p className="text-[10px] text-gray-500 font-medium italic mt-0.5">
                            Nota: "{item.nota}"
                          </p>
                        )}
                        <p className="font-dish text-xs text-primary font-bold mt-1">{item.precio}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                        <button onClick={() => updateQuantity(item.nombre, item.precio, -1, item.opcion, item.cremas, item.nota)} className="text-gray-400">
                          <Minus size={16} />
                        </button>
                        <span className="font-dish font-bold text-sm w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.nombre, item.precio, 1, item.opcion, item.cremas, item.nota)} className="text-primary">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.nombre, item.precio, -item.cantidad, item.opcion, item.cremas, item.nota)}
                        className="text-red-300 ml-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-dashed border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <h3 className="font-dish text-xl font-bold text-dark">Total a pagar</h3>
                  <h3 className="font-dish text-xl font-bold text-primary">S/.{calculateTotal().toFixed(2)}</h3>
                </div>
              </div>
              <button
                onClick={sendToWhatsApp}
                className="w-full bg-[#25D366] text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:scale-[1.02] transition-transform font-bold"
              >
                Enviar Pedido a WhatsApp
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt="Plato ampliado"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBirthdayForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowBirthdayForm(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center"
              >
                <X size={18} className="text-gray-400" />
              </button>

              <div className="flex flex-col items-center text-center mb-5 mt-2">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                  <Gift size={24} className="text-secondary" />
                </div>
                <h2 className="font-title text-2xl text-dark leading-none mb-2">¡Tu Cumpleaños!</h2>
                <p className="text-xs text-gray-500">Déjanos tus datos para enviarte una sorpresa en tu día especial.</p>
              </div>

              {birthdaySuccess ? (
                <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-center text-sm font-bold border border-green-100">
                  ¡Gracias! Tus datos han sido guardados.
                </div>
              ) : (
                <form onSubmit={handleBirthdaySubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
                    <input required type="text" value={birthdayData.nombre} onChange={e => setBirthdayData({...birthdayData, nombre: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50 transition-colors" placeholder="Ej. Juan Pérez" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Teléfono</label>
                    <input required type="tel" minLength={9} maxLength={11} pattern="[0-9]*" value={birthdayData.telefono} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setBirthdayData({...birthdayData, telefono: val});
                    }} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50 transition-colors" placeholder="Ej. 987654321" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Fecha de Nacimiento</label>
                    <input required type="date" value={birthdayData.fechaNacimiento} onChange={e => setBirthdayData({...birthdayData, fechaNacimiento: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50 transition-colors text-gray-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Distrito</label>
                    <input required type="text" value={birthdayData.distrito} onChange={e => setBirthdayData({...birthdayData, distrito: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50 transition-colors" placeholder="Ej. Miraflores" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Correo Electrónico (Opcional)</label>
                    <input type="email" value={birthdayData.correo} onChange={e => setBirthdayData({...birthdayData, correo: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50 transition-colors" placeholder="correo@ejemplo.com" />
                  </div>
                  
                  <button disabled={isSubmittingBirthday} type="submit" className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-secondary/20 mt-2 disabled:opacity-70 flex justify-center items-center">
                    {isSubmittingBirthday ? <Loader2 size={18} className="animate-spin" /> : "Guardar mis datos"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowReviewForm(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center"
              >
                <X size={18} className="text-gray-400" />
              </button>

              <div className="flex flex-col items-center text-center mb-5 mt-2">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                  <Star size={24} className="text-primary fill-primary" />
                </div>
                <h2 className="font-title text-2xl text-dark leading-none mb-2">¡Calificanos!</h2>
                <p className="text-xs text-gray-500">Tu opinión es muy importante para nosotros.</p>
              </div>

              {reviewSuccess ? (
                <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-center text-sm font-bold border border-green-100">
                  ¡Gracias por tu reseña! Nos ayuda a mejorar.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-500 mb-2">Atención del Mozo</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} type="button" 
                          onClick={() => setReviewData({...reviewData, estrellasMozo: star})}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star size={28} className={reviewData.estrellasMozo >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-500 mb-2">Calidad de la Comida</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} type="button" 
                          onClick={() => setReviewData({...reviewData, estrellasComida: star})}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star size={28} className={reviewData.estrellasComida >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Comentario (Opcional)</label>
                    <textarea 
                      rows={3} 
                      value={reviewData.comentario} 
                      onChange={e => setReviewData({...reviewData, comentario: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none mt-1" 
                      placeholder="Cuéntanos más sobre tu experiencia..." 
                    />
                  </div>
                  
                  <button disabled={isSubmittingReview} type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary/20 mt-2 disabled:opacity-70 flex justify-center items-center">
                    {isSubmittingReview ? <Loader2 size={18} className="animate-spin" /> : "Enviar Reseña"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCustomizationDish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%", scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedCustomizationDish(null)}
                className="absolute top-5 right-5 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X size={18} className="text-gray-500" />
              </button>

              <div className="flex flex-col mb-6 mt-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Personalización</span>
                <h2 className="font-title text-2xl text-dark leading-tight">{selectedCustomizationDish.nombre}</h2>
                <p className="text-xs text-gray-400 mt-1">{selectedCustomizationDish.descripcion}</p>
              </div>

              <div className="space-y-6">
                {/* 1. Acompañamiento */}
                <div>
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">1. Selecciona tu Opción</h3>
                  <div className="space-y-2.5">
                    {[
                      { id: "opcion-1", text: "con papas fritas y ensalada clásica", label: "Opción 1: Con ensalada clásica" },
                      { id: "opcion-2", text: "con papas fritas y arroz chaufa", label: "Opción 2: Con arroz chaufa" }
                    ].map(opt => {
                      const isSelected = customizationOptions.opcion === opt.text;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setCustomizationOptions(prev => ({ ...prev, opcion: opt.text }))}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between
                            ${isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex flex-col">
                            <span className={`text-[13px] font-bold ${isSelected ? 'text-primary' : 'text-dark'}`}>{opt.label}</span>
                            <span className="text-[10px] text-gray-400 capitalize mt-0.5">{opt.text}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white animate-scale-up" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Cremas */}
                <div>
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">2. Cremas (Opcional)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "mayo", label: "Mayonesa", value: "Mayonesa" },
                      { id: "ketchup", label: "Ketchup", value: "Ketchup" },
                      { id: "aji", label: "Ají de Pollería", value: "Ají de Pollería" }
                    ].map(crema => {
                      const isSelected = customizationOptions.cremas.includes(crema.value);
                      return (
                        <button
                          key={crema.id}
                          type="button"
                          onClick={() => {
                            setCustomizationOptions(prev => {
                              const alreadySelected = prev.cremas.includes(crema.value);
                              const newCremas = alreadySelected
                                ? prev.cremas.filter(c => c !== crema.value)
                                : [...prev.cremas, crema.value];
                              return { ...prev, cremas: newCremas };
                            });
                          }}
                          className={`p-3 rounded-2xl border-2 text-[11px] font-bold transition-all duration-200 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer
                            ${isSelected
                              ? 'border-secondary bg-secondary/5 text-secondary font-black shadow-sm'
                              : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          <span className="text-lg">{crema.id === 'mayo' ? '🥛' : crema.id === 'ketchup' ? '🥫' : '🌶️'}</span>
                          {crema.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Notas */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">3. Nota Adicional</h3>
                    <span className="text-[9px] text-gray-400 font-medium">Opcional</span>
                  </div>
                  <textarea
                    rows={2}
                    value={customizationOptions.nota}
                    onChange={e => setCustomizationOptions(prev => ({ ...prev, nota: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-gray-300"
                    placeholder="Ej: ensalada sin pepino, papas bien cocidas, etc."
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    addCustomizedToCart(
                      selectedCustomizationDish,
                      customizationOptions.opcion,
                      customizationOptions.cremas,
                      customizationOptions.nota
                    );
                    setSelectedCustomizationDish(null);
                  }}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Agregar al Pedido
                </motion.button>
                <button
                  onClick={() => setSelectedCustomizationDish(null)}
                  className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
