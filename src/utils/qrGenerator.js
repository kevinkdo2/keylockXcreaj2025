// src/utils/qrGenerator.js

/**
 * Este archivo utiliza la librería 'qrcode' para generar códigos QR
 * Asegúrate de instalar la dependencia: npm install qrcode
 */

const QRCode = require('qrcode');

/**
 * Genera un código QR como una cadena de datos URL
 * @param {string} data - Los datos a codificar en el QR
 * @returns {Promise<string>} - String con formato data URL del QR generado
 */
async function generateQRToDataURL(data) {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('Error al generar QR:', error);
    throw error;
  }
}

/**
 * Genera un código QR y lo guarda como un archivo
 * @param {string} data - Los datos a codificar en el QR
 * @param {string} filePath - Ruta donde guardar el archivo QR
 * @returns {Promise<void>}
 */
async function generateQRToFile(data, filePath) {
  try {
    await QRCode.toFile(filePath, data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return true;
  } catch (error) {
    console.error('Error al generar QR en archivo:', error);
    throw error;
  }
}

module.exports = {
  generateQRToDataURL,
  generateQRToFile
};