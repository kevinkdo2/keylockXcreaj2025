// Script para animaciones y validaciones adicionales en las páginas de auth

document.addEventListener('DOMContentLoaded', function() {
    // Validación de formularios
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
      // Validación personalizada de campos
      const inputs = form.querySelectorAll('input');
      
      inputs.forEach(input => {
        // Quitar mensajes de error al enfocar el campo
        input.addEventListener('focus', function() {
          const errorElement = this.parentElement.querySelector('.error-message');
          if (errorElement) {
            errorElement.style.display = 'none';
          }
        });
        
        // Validación en tiempo real
        input.addEventListener('blur', function() {
          validateField(this);
        });
      });
      
      // Validación al enviar el formulario
      form.addEventListener('submit', function(e) {
        let isValid = true;
        
        inputs.forEach(input => {
          if (!validateField(input)) {
            isValid = false;
          }
        });
        
        if (!isValid) {
          e.preventDefault();
        }
      });
    });
    
    // Función para validar un campo
    function validateField(field) {
      const errorElement = field.parentElement.querySelector('.error-message');
      let errorMessage = '';
      let isValid = true;
      
      // Validar según el tipo de campo
      if (field.value.trim() === '') {
        errorMessage = 'Este campo es obligatorio';
        isValid = false;
      } else if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
          errorMessage = 'Ingrese un correo electrónico válido';
          isValid = false;
        }
      } else if (field.id === 'contrasena') {
        if (field.value.length < 8) {
          errorMessage = 'La contraseña debe tener al menos 8 caracteres';
          isValid = false;
        } else if (!/\d/.test(field.value)) {
          errorMessage = 'La contraseña debe incluir al menos un número';
          isValid = false;
        } else if (!/[a-z]/.test(field.value)) {
          errorMessage = 'La contraseña debe incluir al menos una letra minúscula';
          isValid = false;
        }
      } else if (field.id === 'confirmar_contrasena') {
        const passwordField = document.getElementById('contrasena');
        if (field.value !== passwordField.value) {
          errorMessage = 'Las contraseñas no coinciden';
          isValid = false;
        }
      }
      
      // Mostrar o eliminar mensaje de error
      if (errorElement) {
        if (!isValid) {
          errorElement.textContent = errorMessage;
          errorElement.style.display = 'block';
          field.classList.add('error');
        } else {
          errorElement.style.display = 'none';
          field.classList.remove('error');
        }
      }
      
      return isValid;
    }
    
    // Animación entre tabs
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        const isLinkTab = this.getAttribute('href');
        if (isLinkTab) {
          return; // Permitir navegación normal si es un enlace
        }
        
        e.preventDefault();
        
        // Remover clase active de todos los tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Agregar clase active al tab actual
        this.classList.add('active');
        
        // Mostrar el formulario correspondiente con animación
        const targetId = this.getAttribute('data-target');
        const forms = document.querySelectorAll('.form-wrapper');
        
        forms.forEach(form => {
          form.style.display = 'none';
        });
        
        const targetForm = document.getElementById(targetId);
        if (targetForm) {
          targetForm.style.display = 'block';
          targetForm.style.animation = 'fadeIn 0.5s ease';
        }
      });
    });
  });
  
  // Función para mostrar/ocultar contraseña
  function togglePassword(buttonId, inputId) {
    const toggleBtn = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    
    if (toggleBtn && input) {
      toggleBtn.addEventListener('click', function() {
        if (input.type === 'password') {
          input.type = 'text';
          this.textContent = 'Ocultar';
        } else {
          input.type = 'password';
          this.textContent = 'Mostrar';
        }
      });
    }
  }
  
  // Inicializar toggle de contraseña si existen los elementos
  document.addEventListener('DOMContentLoaded', function() {
    togglePassword('togglePassword', 'contrasena');
    togglePassword('toggleConfirmPassword', 'confirmar_contrasena');
  });