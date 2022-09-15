import { IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    password: string;
}