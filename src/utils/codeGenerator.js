// src/utils/codeGenerator.js

/**
 * Genera un código único para los paquetes
 * El formato será: PKG-XXXXX-YYYY donde:
 * - XXXXX es un alfanumérico aleatorio
 * - YYYY es el año actual
 * @returns {string} Código único generado
 */
function generateUniqueCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 5;
    let randomCode = '';
    
    // Generar parte aleatoria del código
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomCode += characters.charAt(randomIndex);
    }
    
    // Agregar año actual
    const currentYear = new Date().getFullYear();
    
    // Formato final
    return `PKG-${randomCode}-${currentYear}`;
  }
  
  module.exports = {
    generateUniqueCode
  };