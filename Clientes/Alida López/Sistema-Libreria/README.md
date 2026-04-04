# J&G Systems - Plataforma Todo-en-Uno para Negocios

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen.svg)](https://mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC.svg)](https://tailwindcss.com/)

> **Tu negocio bajo control** - Solución completa para emprendedores y pequeñas empresas.

---

## 📋 Descripción

J&G Systems es una plataforma **todo-en-uno** que incluye:

- 🛍️ **Ecommerce completo** (catálogo, carrito, checkout, pedidos)
- 💰 **Contabilidad y control de dinero** (ingresos, gastos, deudas, reportes)
- 📅 **Sistema de reservas** (citas, profesionales, horarios)
- 🎨 **Landing page personalizable** (secciones dinámicas)
- 🔐 **Módulos contratables por separado**
- 👑 **Panel superadmin** para gestionar clientes

---

## 🚀 Características Principales

### 🛍️ Ecommerce
- Catálogo de productos con múltiples imágenes
- Carrito de compras persistente
- Checkout con cupones y cálculo de envíos
- Sistema de reseñas y valoraciones
- Lista de deseos (Wishlist)
- Productos relacionados
- Panel admin de productos, categorías y pedidos

### 💰 Contabilidad
- Dashboard con resumen de ingresos/gastos
- Ventas rápidas (POS)
- Gestión de deudas (clientes y proveedores)
- Reportes y gráficas
- Exportar a PDF
- Múltiples métodos de pago

### 📅 Reservas
- Servicios con duración y precio
- Profesionales y horarios
- Calendario interactivo
- Reservas de clientes (con/sin cuenta)
- Panel admin de reservas

### 🎨 Landing Page
- Secciones dinámicas (Hero, Características, Testimonios, etc.)
- Drag & drop para reordenar
- Animaciones personalizables
- Estilos configurables

### 🔐 Autenticación
- Login/registro con roles (user, admin, superadmin)
- Perfil de usuario
- Recuperación de contraseña

---


---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18 | UI |
| Vite | 4 | Build tool |
| TailwindCSS | 3 | Estilos |
| React Router DOM | 6 | Navegación |
| Chart.js | 4 | Gráficas |
| html2canvas + jsPDF | - | Exportar PDF |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 18 | Runtime |
| Express | 4 | API |
| MongoDB | 6 | Base de datos |
| Mongoose | 7 | ODM |
| JWT | 9 | Autenticación |

---

## 📦 Instalación

### Requisitos previos
- Node.js 18+
- MongoDB 6+ (local o Atlas)
- npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/rafita75/J-G-Systems-Plantilla-Basica.git
cd client-app

# 2. Instalar dependencias del backend
cd server
npm install

# 3. Configurar variables de entorno
cp .env.example .env Por el momento no
# Editar .env con tus credenciales

# 4. Instalar dependencias del frontend
cd ../client
npm install

# 5. Configurar variables de entorno del frontend
cp .env.example .env Por el momento no

# 6. Iniciar en desarrollo
# Terminal 1 (backend)
cd server
npm run dev

# Terminal 2 (frontend)
cd client
npm run dev