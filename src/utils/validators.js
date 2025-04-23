/**
 * Funciones de utilidad para validaciones
 */

/**
 * Valida que un correo electrónico tenga un formato válido
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} - true si es válido, false si no
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Valida la fortaleza de una contraseña
   * @param {string} password - Contraseña a validar
   * @returns {object} - Resultado de la validación con errores si los hay
   */
  const validatePassword = (password) => {
    const result = {
      isValid: true,
      errors: []
    };
  
    // Validar longitud mínima
    if (password.length < 8) {
      result.isValid = false;
      result.errors.push('La contraseña debe tener al menos 8 caracteres');
    }
  
    // Validar que incluya al menos un número
    if (!/\d/.test(password)) {
      result.isValid = false;
      result.errors.push('La contraseña debe incluir al menos un número');
    }
  
    // Validar que incluya al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      result.isValid = false;
      result.errors.push('La contraseña debe incluir al menos una letra minúscula');
    }
  
    return result;
  };
  
  /**
   * Sanitiza un texto eliminando caracteres potencialmente peligrosos
   * @param {string} text - Texto a sanitizar
   * @returns {string} - Texto sanitizado
   */
  const sanitizeText = (text) => {
    if (!text) return '';
    
    // Remover etiquetas HTML y caracteres especiales
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/[<>'"`;=]/g, '');
  };
  
  module.exports = {
    isValidEmail,
    validatePassword,
    sanitizeText
  };