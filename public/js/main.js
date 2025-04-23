// Agregar al archivo public/js/main.js o crear uno nuevo si no existe

document.addEventListener('DOMContentLoaded', function() {
    // Mejorar la funcionalidad del menú desplegable en móviles
    const dropdownToggles = document.querySelectorAll('.nav-link.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        // En pantallas pequeñas, queremos que el clic abra/cierre el menú
        if (window.innerWidth <= 768) {
          e.preventDefault();
          
          const dropdownMenu = this.nextElementSibling;
          const isVisible = dropdownMenu.style.display === 'block';
          
          // Cerrar todos los otros menús desplegables
          document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu !== dropdownMenu) {
              menu.style.display = 'none';
            }
          });
          
          // Alternar visibilidad de este menú
          dropdownMenu.style.display = isVisible ? 'none' : 'block';
        }
      });
    });
    
    // Cerrar menús desplegables cuando se hace clic fuera de ellos
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-item.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.style.display = '';
        });
      }
    });
    
    // Destacar la sección actual en el menú de navegación
    highlightCurrentSection();
  });
  
  // Función para destacar la sección actual en el menú
  function highlightCurrentSection() {
    const currentPath = window.location.pathname;
    
    // Obtener todos los enlaces del menú
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
      // Si el enlace coincide con la ruta actual (o es una subruta)
      if (currentPath === link.getAttribute('href') || 
          (currentPath.startsWith('/admin/') && link.getAttribute('href') === '/admin/dashboard')) {
        link.classList.add('active');
        
        // Si está dentro de un dropdown, también marcar el toggle
        const dropdown = link.closest('.dropdown-menu');
        if (dropdown) {
          const toggle = dropdown.previousElementSibling;
          toggle.classList.add('active');
        }
      } else {
        link.classList.remove('active');
      }
    });
  }