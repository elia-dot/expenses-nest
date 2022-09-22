import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpenseDto } from './dto/create-expense.dto';
import { ExpenseService } from './expense.service';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  async createExpense(@Res() res, @Req() req, @Body() expenseDto: ExpenseDto) {
    const expense = await this.expenseService.createExpense(
      expenseDto,
      req.user,
    );
    res.status(201).json({ expense });
  }

  @Get()
  async getExpenses(@Res() res, @Req() req) {
    const expenses = await this.expenseService.getExpenses(req.user.groupId);
    res.status(200).json({ expenses });
  }

  @Get('by-category')
  async getSumByCategory(@Res() res, @Req() req) {
    const sumByCategory = await this.expenseService.getExpensesByCategory(
      req.user.groupId,
    );
    res.status(200).json(sumByCategory);
  }

  @Get('by-user')
  async getExpensesByUser(@Res() res, @Req() req) {
    const sumByUser = await this.expenseService.getExpensesByUser(req.user.groupId);
    res.status(200).json(sumByUser);
  }

  @Get('user/:id')
  async getExpensesByUserId(@Res() res, @Req() req) {
    const expenses = await this.expenseService.getExpensesByUserId(
      req.params.id,
    );
    res.status(200).json({ expenses });
  }

  @Get('shop/:id')
  async getExpensesByShopId(@Res() res, @Req() req) {
    const expenses = await this.expenseService.getExpensesByShop(
      req.params.id,
      req.user.groupId,
    );
    res.status(200).json({ expenses });
  }

  @Get('monthly')
  async getMonthlyExpenses(@Res() res, @Req() req) {
    const monthlyExpenses = await this.expenseService.getMonthlyExpenses(
      req.user.groupId,
    );
    res.status(200).json(monthlyExpenses);
  }

  @Get(':id')
  async getExpense(@Res() res, @Req() req) {
    const expense = await this.expenseService.getExpense(req.params.id);
    res.status(200).json({ expense });
  }

  @Delete(':id')
  async deleteExpense(@Res() res, @Req() req) {
    const expense = await this.expenseService.deleteExpense(req.params.id);
    res.status(200).json({ expense });
  }
}
