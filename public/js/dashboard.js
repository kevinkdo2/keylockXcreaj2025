// Script para funcionalidades del dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard cargado correctamente');
    
    // Animación para las tarjetas
    const cards = document.querySelectorAll('.card');
    
    // Añadir animación con pequeño retraso entre cada tarjeta
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    });
    
    // Ejemplo: función para obtener datos de usuario (para futura implementación)
    function getUserData() {
      // Esta función podría hacer una petición AJAX para obtener datos actualizados
      // del usuario o estadísticas para mostrar en el dashboard
      console.log('Función para obtener datos del usuario');
    }
  });