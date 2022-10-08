import { IsNotEmpty } from 'class-validator';

export class ExpenseDto {
  @IsNotEmpty()
  amount: string;

  @IsNotEmpty()
  shop: string;

  description: string;

  installments: number;
}
