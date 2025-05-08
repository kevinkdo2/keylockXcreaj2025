// public/js/paquetes.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de paquetes cargado correctamente');
    
    // Función para filtrar por estado
    const filterEstado = document.getElementById('filterEstado');
    if (filterEstado) {
      filterEstado.addEventListener('change', function() {
        const estado = this.value;
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          if (!estado || row.dataset.estado === estado) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    }
    
    // Función para buscar paquetes
    const searchInput = document.getElementById('searchPaquete');
    if (searchInput) {
      searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          const codigo = row.cells[0].textContent.toLowerCase();
          const destinatario = row.cells[1].textContent.toLowerCase();
          const remitente = row.cells[2].textContent.toLowerCase();
          
          if (codigo.includes(searchTerm) || 
              destinatario.includes(searchTerm) || 
              remitente.includes(searchTerm)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    }
    
    // Validación de formulario de paquetes
    const paqueteForm = document.querySelector('.admin-form');
    if (paqueteForm) {
      const tamanoSelect = document.getElementById('tamano');
      const casilleroSelect = document.getElementById('id_casillero');
      const tamanoWarning = document.getElementById('tamanoWarning');
      
      // Función para verificar compatibilidad entre tamaño del paquete y casillero
      function checkTamanoCompatibility() {
        if (!casilleroSelect.value || !tamanoSelect.value) {
          tamanoWarning.style.display = 'none';
          return;
        }
        
        const selectedOption = casilleroSelect.options[casilleroSelect.selectedIndex];
        const casilleroTamano = selectedOption.getAttribute('data-tamano');
        const paqueteTamano = tamanoSelect.value;
        
        let showWarning = false;
        
        // Lógica para verificar compatibilidad
        if (casilleroTamano === 'pequeño' && paqueteTamano !== 'pequeño') {
          showWarning = true;
        } else if (casilleroTamano === 'mediano' && paqueteTamano === 'grande') {
          showWarning = true;
        }
        
        tamanoWarning.style.display = showWarning ? 'block' : 'none';
      }
      
      // Asignar eventos
      if (tamanoSelect && casilleroSelect && tamanoWarning) {
        tamanoSelect.addEventListener('change', checkTamanoCompatibility);
        casilleroSelect.addEventListener('change', checkTamanoCompatibility);
        
        // Verificar al cargar la página
        checkTamanoCompatibility();
      }
      
      // Validación al enviar el formulario
      paqueteForm.addEventListener('submit', function(e) {
        // Validar que haya casilleros disponibles
        if (casilleroSelect && casilleroSelect.options.length <= 1) {
          e.preventDefault();
          alert('No hay casilleros disponibles para asignar. Por favor, libere algún casillero primero.');
          return false;
        }
        
        // Se podría añadir más validaciones según sea necesario
      });
    }
    
    // Funcionalidad para botones de cambio de estado
    const statusButtons = document.querySelectorAll('.change-status');
    if (statusButtons.length > 0) {
      statusButtons.forEach(button => {
        button.addEventListener('click', function() {
          const id = this.dataset.id;
          const action = this.dataset.action;
          const modal = document.getElementById('statusModal');
          const form = document.getElementById('statusForm');
          const estadoInput = document.getElementById('estadoInput');
          
          form.action = `/admin/paquetes/estado/${id}`;
          estadoInput.value = action;
          modal.style.display = 'flex';
        });
      });
      
      // Función para cerrar modal de estado
      window.closeStatusModal = function() {
        const modal = document.getElementById('statusModal');
        modal.style.display = 'none';
      };
    }
    
    // Funcionalidad para modal de eliminación
    window.confirmDelete = function(id, codigo) {
      const modal = document.getElementById('deleteModal');
      const codigoSpan = document.getElementById('deletePaqueteCodigo');
      const confirmBtn = document.getElementById('confirmDeleteBtn');
      
      codigoSpan.textContent = codigo;
      confirmBtn.href = `/admin/paquetes/delete/${id}`;
      modal.style.display = 'flex';
    };
    
    window.closeModal = function() {
      const modal = document.getElementById('deleteModal');
      modal.style.display = 'none';
    };
    
    // Cerrar modales al hacer clic fuera
    window.onclick = function(event) {
      const deleteModal = document.getElementById('deleteModal');
      const statusModal = document.getElementById('statusModal');
      
      if (deleteModal && event.target === deleteModal) {
        closeModal();
      } 
      
      if (statusModal && event.target === statusModal) {
        closeStatusModal();
      }
    };
    
    // Funcionalidad para imprimir QR
    window.printQR = function() {
      const printContent = document.querySelector('.qr-container').innerHTML;
      const originalContent = document.body.innerHTML;
      
      // Crear una versión simplificada para imprimir
      document.body.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h2>Código QR para Paquete</h2>
          ${printContent}
        </div>
      `;
      
      window.print();
      
      // Restaurar contenido original
      document.body.innerHTML = originalContent;
      
      // Recargar scripts después de restaurar el contenido
      location.reload();
    };
    
    // Funcionalidad para autocompletado de casillero según tamaño del paquete
    const tamanoSelect = document.getElementById('tamano');
    const casilleroSelect = document.getElementById('id_casillero');
    
    if (tamanoSelect && casilleroSelect && casilleroSelect.options.length > 1) {
      tamanoSelect.addEventListener('change', function() {
        const selectedTamano = this.value;
        
        // Recorrer opciones de casilleros y preseleccionar uno compatible
        let compatibleFound = false;
        
        for (let i = 1; i < casilleroSelect.options.length; i++) {
          const option = casilleroSelect.options[i];
          const casilleroTamano = option.getAttribute('data-tamano');
          
          let isCompatible = false;
          
          // Lógica de compatibilidad
          if (selectedTamano === 'pequeño') {
            // Un paquete pequeño cabe en cualquier casillero
            isCompatible = true;
          } else if (selectedTamano === 'mediano') {
            // Un paquete mediano cabe en casilleros medianos y grandes
            isCompatible = (casilleroTamano === 'mediano' || casilleroTamano === 'grande');
          } else if (selectedTamano === 'grande') {
            // Un paquete grande solo cabe en casilleros grandes
            isCompatible = (casilleroTamano === 'grande');
          }
          
          if (isCompatible && !compatibleFound) {
            casilleroSelect.selectedIndex = i;
            compatibleFound = true;
            break;
          }
        }
        
        // Si se encontró un casillero compatible, disparar el evento change
        if (compatibleFound) {
          const event = new Event('change');
          casilleroSelect.dispatchEvent(event);
        }
      });
    }
  });