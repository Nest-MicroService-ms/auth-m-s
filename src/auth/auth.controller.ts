import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
    foo.* matches foo.bar, foo.baz, and so on, but not foo.bar.baz
    foo.*.bar matches foo.baz.bar, foo.qux.bar, and so on, but not foo.bar or foo.bar.baz
    foo.> matches foo.bar, foo.bar.baz, and so on
  */

  @MessagePattern('auth.register.uer')
  register(@Payload() registerUserDto: RegisterUserDto) { 
    return this.authService.register(registerUserDto);
  }

  @MessagePattern('login.user')
  login(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern('auth.verify.user')
  verifyToken(@Payload() token : string) {
    return this.authService.verifyToken(token);
  }
}
