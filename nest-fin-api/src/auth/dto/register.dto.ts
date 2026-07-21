import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email!: string;
  @IsString()
  @MinLength(8)
  @MaxLength(24)
  password!: string;
}
