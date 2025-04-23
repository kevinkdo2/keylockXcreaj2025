// public/js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel de administración cargado correctamente');
    
    // Animación para las tarjetas de estadísticas
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    });
    
    // Búsqueda en tablas
    const searchInput = document.getElementById('searchEmpresa');
    if (searchInput) {
      searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const table = document.querySelector('.data-table');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          const nombre = row.cells[1].textContent.toLowerCase();
          const correo = row.cells[2].textContent.toLowerCase();
          
          if (nombre.includes(searchTerm) || correo.includes(searchTerm)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    }
  });