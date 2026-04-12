import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';

const proxyTargets = [
  {
    path: '/cdn',
    target: 'https://cdn.brawltree.me'
  },
  {
    path: '/youtube',
    target: 'https://www.googleapis.com/youtube/v3'
  },
  {
    path: '/inbox',
    target: 'https://brawlstars.inbox.supercell.com'
  }
] as const;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  proxyTargets.forEach(({ path, target }) => {
    app.use(
      path,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: true
      })
    );
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'https://brawltree.me',
      'https://www.brawltree.me',
      'http://localhost:3323',
      'http://127.0.0.1:3323',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('HOST_PORT', 3000);

  await app.listen(port);

  return port;
}

bootstrap().then((port) => {
  Logger.log(`Plant Brawl Tree at ${port}`);
});
