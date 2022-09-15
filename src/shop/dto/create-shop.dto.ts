import { IsNotEmpty } from "class-validator";

export class ShopDto {
@IsNotEmpty()
name: string;

category: string;

isOnline: boolean;
}