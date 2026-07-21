import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /**
   * @example klimentmart@gmail.com
   */
  @IsEmail()
  email!: string;

  /**
   * @example Klim.Space070506
   */
  @IsString()
  @IsNotEmpty()
  password!: string;
}
