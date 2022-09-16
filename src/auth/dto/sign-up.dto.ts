import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  password: string;
}
