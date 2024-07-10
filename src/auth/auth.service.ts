import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LoginUserDto,RegisterUserDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('AuthService');

  constructor(
    private jwtService: JwtService
  ) {
    super();//Necesita una Inicializacion
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('MongoDB Connected');
  }

  async singJWT ( jwtPayload : JwtPayload ) {

    return this.jwtService.sign( jwtPayload );
  }

 async findOne ( email? : string, name? : string) {

  //const user = await this.user.findFirst( { where: {  email: email } } );
  try {

    const user = await this.user.findFirst({
      where: {
        OR: [
          { email: email },
          { name: name },
        ],
      },
    });
    return user;
  
  }
  catch(error){
    return null;
  }
  
 }



  async register(registerUserDto : RegisterUserDto) {

    const {email, name, password } = registerUserDto;

    try {

      const user = await this.findOne(email,name);

      if(user) throw new RpcException( { status : 400, message : 'User already Exists'});

      const data:RegisterUserDto = {
        email,
        name,
        password : bcrypt.hashSync( password,10 )
      }

      const newUser = await this.user.create({ data : { ...data } });

      const { password:__, ...userAdd} = newUser;


      return {
        user : userAdd,
        token : await this.singJWT( userAdd )
      }


    }
    catch (error) {
      this.logger.error(error);
    }
  
  }

  async login(loginUserDto: LoginUserDto) {
    const {email,  password } = loginUserDto;

    try {

      const userDB = await this.findOne(email);

      if(!userDB) throw new RpcException( { status : 400, message : 'Invalid Credecial'});


      //Valida Password
      const isPasswordValid = bcrypt.compareSync( password, userDB.password! );

      if(!isPasswordValid) throw new RpcException( { status : 400, message : 'User/Password Not Valid'});



      const { password:__, ...user} = userDB;

      return {
        user,
        token :  await this.singJWT( user )
      }


    }
    catch (error) {
      this.logger.error(error);
    }
  
  }

  async verifyToken(token : string) {

    try {

        const { sub,iat,exp,...user} = this.jwtService.verify(token, {
          secret : envs.JWT_SECRET
        });

        return {
          user,
          token :  await this.singJWT(user)
        }
    }
    catch(error) {

      throw new RpcException( { status : 401, message : 'Invalid Token'});

    }
  }

}
