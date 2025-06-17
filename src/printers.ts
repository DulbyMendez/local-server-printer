interface PrinterConfig {
  ip: string;
  port: number;
}

interface Printers {
  [key: string]: PrinterConfig;
}

// Inicialmente no hay impresoras configuradas
export let printers: Printers = {};

// Función para actualizar la configuración
export function updatePrinterConfig(printerId: string, config: PrinterConfig) {
  printers[printerId] = config;
  // Aquí podríamos guardar la configuración en un archivo para persistencia
  console.log('🖨️ Configuración actualizada:', printers);
}
