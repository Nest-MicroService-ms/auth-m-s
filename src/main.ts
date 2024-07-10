import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config/envs';

/*
* Link
* - https://docs.nestjs.com/microservices/basics
* - https://docs.nestjs.com/recipes/prisma
* - https://www.prisma.io/docs/orm/overview/databases/mongodb
* - https://nats.io/
* - https://hub.docker.com/_/nats
* - - docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats:lates
* - - http://localhost:8222/
* - https://docs.nestjs.com/security/authentication
* - https://docs.nestjs.com/custom-decorators
* - https://docs.nestjs.com/guards
* Instalar  
* - npm i --save @nestjs/microservices
* - npm install prisma --save-dev
* - npx prisma init (Editar archivo .env)
* NOTA : Modificar "prisma/schema.prima" segun el modelo de la bdd, una vez realizado ejecuta
* el siguiente comando para realizar la migracion 
* - npm install @prisma/client
* - npx prisma generate (genera el cliente de prisma - reintalar project)
* - npm i --save nats
* - npm i --save-dev @types/bcrypt
* - npm install --save @nestjs/jwt
*/

async function bootstrap() {

  const logger = new Logger('Auth-MS');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS,
        waitOnFirstConnect : true 

      },
    },
  );
   
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen();
  logger.log(`Orders Microservice running on port ${envs.PORT}`);




}
bootstrap();
