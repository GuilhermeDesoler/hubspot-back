import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir arquivos estáticos (HTML do iframe)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/iframe/',
  });

  // Habilita CORS para permitir requisições do iframe do HubSpot
  app.enableCors({
    origin: [
      'https://app.hubspot.com',
      'https://app-eu1.hubspot.com',
      'http://localhost:3000',
      'http://localhost:5173',
      '*' // Para desenvolvimento local
    ],
    credentials: true
  });

  // Prefixo global para as rotas (opcional)
  // app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📡 API disponível em http://localhost:${port}/api`);
  console.log(`🖼️  Iframe disponível em http://localhost:${port}/iframe/add-option.html`);
}

bootstrap();
