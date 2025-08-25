import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @Length(3, 12)
    username: string;

    @IsString()
    @MinLength(8)
    password: string
}
