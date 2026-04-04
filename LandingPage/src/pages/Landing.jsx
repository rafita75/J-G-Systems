import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage('');
    setTimeout(() => {
      setFormMessage('✅ ¡Solicitud enviada! Te contactaremos pronto.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setFormLoading(false);
      setTimeout(() => setFormMessage(''), 5000);
    }, 1500);
  };

  const modules = [
    {
      name: 'Landing Page',
      icon: '🎨',
      price: 'Q250',
      description: 'Página profesional con secciones dinámicas, animaciones y diseño moderno.',
    },
    {
      name: 'Ecommerce + Login',
      icon: '🛍️',
      price: 'Q500',
      description: 'Tienda online completa con catálogo, carrito, checkout y autenticación.',
    },
    {
      name: 'Contabilidad + Ecommerce',
      icon: '💰',
      price: 'Q700',
      description: 'Control de ingresos, gastos, deudas, reportes + tienda online.',
    },
    {
      name: 'Reservas + Login',
      icon: '📅',
      price: 'Q400',
      description: 'Sistema de citas con profesionales, horarios y gestión de servicios.',
    }
  ];

  const features = [
    { icon: '🎯', title: 'Control total', desc: 'Administra todo tu negocio desde un solo lugar' },
    { icon: '⚡', title: 'Automatización', desc: 'Elimina tareas repetitivas y ahorra tiempo' },
    { icon: '📊', title: 'Decisiones informadas', desc: 'Reportes y estadísticas en tiempo real' },
    { icon: '🔧', title: 'Personalizable', desc: 'Adapta el sistema a las necesidades de tu negocio' },
    { icon: '💡', title: 'Sin complicaciones', desc: 'Interfaz intuitiva que cualquiera puede usar' },
    { icon: '🚀', title: 'Escalable', desc: 'Crece con tu negocio, añade módulos cuando lo necesites' }
  ];

  const plans = [
    {
      name: 'Fijo',
      price: 'Q200',
      period: 'anual',
      description: 'Ideal para empezar',
      features: ['Dominio incluido', 'Base de datos pequeña gratuita', 'Soporte básico'],
      icon: '🌱'
    },
    {
      name: 'Básico',
      price: 'Q150',
      period: 'mensual',
      description: 'Para negocios en crecimiento',
      features: ['Modificaciones básicas', 'Mantenimiento y actualizaciones', 'Soporte prioritario'],
      icon: '📈',
      popular: true
    },
    {
      name: 'Pro',
      price: 'Q450',
      period: 'mensual',
      description: 'Para negocios con alta demanda',
      features: ['Base de datos grande', '10GB de almacenamiento', 'Creación de 1 módulo personalizado', 'Soporte 24/7', 'Todo lo del plan Básico'],
      icon: '💎'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-soft py-3' : 'bg-white py-4'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">J&G</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                J&G Systems
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-8">
              <a href="#inicio" className="text-gray-600 hover:text-blue-600 transition">Inicio</a>
              <a href="#modulos" className="text-gray-600 hover:text-blue-600 transition">Módulos</a>
              <a href="#precios" className="text-gray-600 hover:text-blue-600 transition">Precios</a>
              <a href="#contacto" className="text-gray-600 hover:text-blue-600 transition">Contacto</a>
            </nav>

            {/* Botón CTA */}
            <button
              onClick={() => setShowModal(true)}
              className="hidden lg:block btn btn-primary"
            >
              Solicitar Demo
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
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

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pt-4 border-t flex flex-col gap-3 animate-fade-in">
              <a href="#inicio" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Inicio</a>
              <a href="#modulos" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Módulos</a>
              <a href="#precios" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Precios</a>
              <a href="#contacto" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
              <button
                onClick={() => {
                  setShowModal(true);
                  setMobileMenuOpen(false);
                }}
                className="btn btn-primary w-full mt-2"
              >
                Solicitar Demo
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-blue-600 font-medium">Tu negocio bajo control</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Gestiona tu negocio
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  de forma inteligente
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Soluciones digitales para emprendedores y empresas que buscan optimizar sus procesos y crecer sin complicaciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
                  Solicitar Demo
                </Button>
                <a href="#modulos">
                  <Button variant="outline" size="lg">
                    Conocer módulos
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex-1 animate-float">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-4 shadow-hard">
                  <div className="bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-400 text-sm ml-2">Dashboard</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 bg-gray-700 rounded-lg w-3/4"></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 bg-gray-700 rounded-lg"></div>
                        <div className="h-20 bg-gray-700 rounded-lg"></div>
                        <div className="h-20 bg-gray-700 rounded-lg"></div>
                      </div>
                      <div className="h-32 bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Ofrecemos soluciones diseñadas para simplificar la gestión de tu negocio</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-soft p-6 text-center hover:shadow-medium transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Módulos disponibles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Elige los módulos que necesitas o contrata el combo completo</p>
            <p className="text-sm text-gray-500 mt-2">✨ Puedes agregar módulos más adelante • Solicita módulos personalizados ✨</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">{module.price}</p>
                <Button variant="outline" size="sm" onClick={() => setShowModal(true)} className="w-full">
                  Más información
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <div className="inline-block bg-white rounded-2xl shadow-soft p-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Combo Completo: Landing Page + Ecommerce + Contabilidad + Reservas
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-2">Q1,000</p>
              <p className="text-sm text-gray-500 mt-1">(Ahorra Q350)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="precios" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes de mantenimiento</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Elige el plan que mejor se adapte a las necesidades de tu negocio</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div key={idx} className={`bg-white rounded-2xl shadow-soft p-6 relative hover:shadow-medium transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-2 border-blue-500 shadow-hard' : ''}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm px-4 py-1 rounded-full">
                    Más popular
                  </span>
                )}
                <div className="text-center">
                  <div className="text-4xl mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  <ul className="space-y-3 text-left mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="primary" onClick={() => setShowModal(true)} className="w-full">
                    Contratar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contacto" className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para transformar tu negocio?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Agenda una demostración personalizada y descubre cómo podemos ayudarte
          </p>
          <Button variant="primary" size="lg" onClick={() => setShowModal(true)} className="bg-white text-blue-600 hover:bg-gray-100">
            Solicitar Demo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J&G</span>
                </div>
                <span className="text-white font-bold">J&G Systems</span>
              </div>
              <p className="text-sm">Tu negocio bajo control</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Módulos</h4>
              <ul className="space-y-2 text-sm">
                <li>Landing Page</li>
                <li>Ecommerce</li>
                <li>Contabilidad</li>
                <li>Reservas</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 (+502) 3767-4506</li>
                <li>📞 (+502) 4752-2374</li>
                <li>✉️ info@jgsystems.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition">Facebook</a>
                <a href="#" className="hover:text-white transition">Instagram</a>
                <a href="#" className="hover:text-white transition">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 J&G Systems. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal de contacto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-auto animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">📅 Solicitar Demo</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {formMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200">
                {formMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre"
                required
                icon="👤"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                required
                icon="✉️"
              />
              <Input
                label="Teléfono"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="1234-5678"
                icon="📞"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué módulos te interesan?</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Cuéntanos qué necesitas..."
                />
              </div>
              <Button type="submit" variant="primary" loading={formLoading} className="w-full">
                Solicitar Demo
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Te contactaremos para agendar una demostración personalizada
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}