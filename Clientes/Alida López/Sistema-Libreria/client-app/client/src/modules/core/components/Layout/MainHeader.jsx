// client/src/components/MainHeader.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../login/contexts/AuthContext';
import { useModules } from '../../contexts/ModuleContext';
import { useSections } from '../../../landing/contexts/SectionContext';
import { useCart } from '../../../ecommerce/contexts/CartContext';
import Button from '../UI/Button';

export default function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { hasModule } = useModules();
  const { menuSections } = useSections();
  const { getItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const loginEnabled = hasModule('login');
  const hasEcommerce = hasModule('ecommerce');
  const hasAppointments = hasModule('appointments');
  const cartCount = getItemCount();
  const isHome = location.pathname === '/';
  const isCatalog = location.pathname === '/catalogo';
  const isProductDetail = location.pathname.startsWith('/producto/');
  const isCart = location.pathname === '/carrito';
  
  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Determinar si mostrar las secciones del landing (solo en páginas públicas y sin usuario)
  const showLandingSections = !user && (isHome || isCatalog || isProductDetail || isCart);

  const scrollToSection = (section) => {
    const sectionId = section.title 
      ? section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : section.type;
    
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-soft py-2' 
        : 'bg-white/90 backdrop-blur-sm shadow-sm py-3'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to={user ? "/home" : "/"} 
            className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hover:opacity-80 transition"
          >
            MiMarca
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {/* Secciones del landing (solo visitantes) */}
            {showLandingSections && menuSections.map((section) => (
              <button
                key={section._id}
                onClick={() => scrollToSection(section)}
                className="text-gray-600 hover:text-primary-600 transition font-medium text-sm"
              >
                {section.title || section.type.charAt(0).toUpperCase() + section.type.slice(1)}
              </button>
            ))}
            
            {/* Usuario logueado - opciones adicionales */}
            {user && (
              <>
                <Link 
                  to="/home" 
                  className="text-gray-600 hover:text-primary-600 transition font-medium text-sm"
                >
                  Inicio
                </Link>
                {/* Tienda - visible si ecommerce está activo */}
                {hasEcommerce && (
                  <Link 
                    to="/catalogo" 
                    className="text-gray-600 hover:text-primary-600 transition font-medium text-sm"
                  >
                    Tienda
                  </Link>
                )}
                
                {/* Servicios - visible si reservas está activo */}
                {hasAppointments && (
                  <Link 
                    to="/servicios" 
                    className="text-gray-600 hover:text-primary-600 transition font-medium text-sm"
                  >
                    Servicios
                  </Link>
                )}
                {hasEcommerce && (
                  <Link 
                    to="/mis-pedidos" 
                    className="text-gray-600 hover:text-primary-600 transition font-medium text-sm"
                  >
                    Mis pedidos
                  </Link>
                )}
                {hasAppointments && (
                  <Link 
                    to="/mis-reservas" 
                    className="text-gray-600 hover:text-primary-600 transition font-medium text-sm"
                  >
                    Mis reservas
                  </Link>
                )}
              </>
            )}
          </nav>
          
          {/* Acciones derecha */}
          <div className="flex items-center gap-3">
            {/* Carrito (si ecommerce activo) */}
            {hasEcommerce && (
              <Link 
                to="/carrito" 
                className="relative p-2 text-gray-600 hover:text-primary-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* Wishlist (si ecommerce activo) */}
            {hasEcommerce && user && (
              <Link 
                to="/wishlist" 
                className="p-2 text-gray-600 hover:text-red-500 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
            )}
            
            {/* Botones de autenticación */}
            {loginEnabled && !user && (
              <div className="hidden sm:flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Registrarse
                </Button>
              </div>
            )}
            
            {/* Usuario logueado */}
            {loginEnabled && user && (
              <div className="hidden sm:flex items-center gap-3">
                <Link 
                  to="/perfil" 
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:inline">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                >
                  Salir
                </Button>
              </div>
            )}
            
            {/* Botón menú móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 animate-fade-in">
            {/* Secciones del landing */}
            {showLandingSections && menuSections.map((section) => (
              <button
                key={section._id}
                onClick={() => {
                  scrollToSection(section);
                  setMobileMenuOpen(false);
                }}
                className="text-gray-600 hover:text-primary-600 transition py-2 text-left font-medium"
              >
                {section.title || section.type.charAt(0).toUpperCase() + section.type.slice(1)}
              </button>
            ))}
            
            {/* Opciones de usuario logueado */}
            {user && (
              <>
                <Link
                  to="/home"
                  className="text-gray-600 hover:text-primary-600 transition py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inicio
                </Link>
                {/* Tienda */}
                {hasEcommerce && (
                  <Link
                    to="/catalogo"
                    className="text-gray-600 hover:text-primary-600 transition py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tienda
                  </Link>
                )}
                
                {/* Servicios */}
                {hasAppointments && (
                  <Link
                    to="/servicios"
                    className="text-gray-600 hover:text-primary-600 transition py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Servicios
                  </Link>
                )}
                {hasEcommerce && (
                  <Link
                    to="/mis-pedidos"
                    className="text-gray-600 hover:text-primary-600 transition py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis pedidos
                  </Link>
                )}
                {hasAppointments && (
                  <Link
                    to="/mis-reservas"
                    className="text-gray-600 hover:text-primary-600 transition py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis reservas
                  </Link>
                )}
                <Link
                  to="/perfil"
                  className="text-gray-600 hover:text-primary-600 transition py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Perfil
                </Link>
                {hasEcommerce && (
                  <Link
                    to="/wishlist"
                    className="text-gray-600 hover:text-red-500 transition py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ❤️ Lista de deseos
                  </Link>
                )}
              </>
            )}
            
            {/* Botones de autenticación móvil */}
            {loginEnabled && !user && (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 mt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Registrarse
                </Button>
              </div>
            )}
            
            {/* Botón cerrar sesión móvil */}
            {loginEnabled && user && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <Button
                  variant="danger"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}