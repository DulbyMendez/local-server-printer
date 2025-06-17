import express, { Request, Response, Router, RequestHandler, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { printers, updatePrinterConfig } from './printers.js';
import escpos from 'escpos';
import Network from 'escpos-network';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PrintRequest {
  printerId: string;
  content: string;
}

interface PrinterConfig {
  ip: string;
  port: number;
}

interface Printers {
  [key: string]: PrinterConfig;
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const printHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const { printerId, content } = req.body as PrintRequest;
  console.log('📝 Recibida solicitud de impresión:', { printerId, content });

  const printerConfig = (printers as Printers)[printerId];
  if (!printerConfig) {
    console.error('❌ Impresora no encontrada:', printerId);
    res.status(400).json({ status: 'error', message: 'Printer not found' });
    return;
  }

  console.log('🖨️ Configuración de impresora:', printerConfig);

  try {
    const device = new Network(printerConfig.ip, printerConfig.port);
    const printer = new escpos.Printer(device);

    console.log('🔌 Intentando conectar a la impresora...');
    
    device.open((error) => {
      if (error) {
        console.error('❌ Error al abrir la conexión:', error);
        res.status(500).json({ status: 'error', message: 'Failed to connect to printer' });
        return;
      }

      console.log('✅ Conexión exitosa, enviando datos...');
      
      try {
        printer
          .text(content)
          .feed(5)  // Avanza 5 líneas (aproximadamente 30mm)
          .cut()
          .close();
        
        console.log('✅ Datos enviados correctamente');
        res.json({ status: 'success', message: 'Print job sent' });
      } catch (printError) {
        console.error('❌ Error al enviar datos:', printError);
        res.status(500).json({ status: 'error', message: 'Failed to send print data' });
      }
    });
  } catch (err) {
    console.error('❌ Error general:', err);
    res.status(500).json({ status: 'error', message: 'Failed to print' });
  }
};

// Ruta para guardar la configuración de la impresora
app.post('/config', (req: Request, res: Response) => {
  const { printerId, ip, port } = req.body;
  
  if (!printerId || !ip || !port) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  updatePrinterConfig(printerId, { ip, port });
  res.json({ status: 'success', message: 'Printer configuration updated' });
});

// Ruta para obtener la configuración actual
app.get('/config', (req: Request, res: Response) => {
  res.json({ printers });
});

// Redirigir a la página de configuración si no hay impresoras configuradas
app.get('/', (req: Request, res: Response) => {
  if (Object.keys(printers).length === 0) {
    res.redirect('/config.html');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.post('/print', printHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🖨️ Print server running at http://localhost:${PORT}`);
  console.log('📋 Impresoras configuradas:', printers);
});
