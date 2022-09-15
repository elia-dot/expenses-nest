import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserDocument } from '../user/schemas/user.schema';
import { ShopService } from '../shop/shop.service';
import { ExpenseDto } from './dto/create-expense.dto';
import { ExpenseDocument } from './schemas/expense.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel('Expense') private expenseModel: Model<ExpenseDocument>,
    private shopService: ShopService,
    private userService: UserService,
  ) {}

  async createExpense(
    expenseDto: ExpenseDto,
    user: UserDocument,
  ): Promise<ExpenseDocument> {
    let shop = await this.shopService.getShop(
      expenseDto.shop.trim(),
      user.groupId,
    );

    if (!shop) {
      shop = await this.shopService.createShop(
        expenseDto.shop.trim(),
        user.groupId,
      );
    }
    let expense = await this.expenseModel.create({
      ...expenseDto,
      shop: shop._id,
      createdBy: user._id,
    });

    expense = await (await expense.populate('createdBy')).populate('shop');

    return expense;
  }

  async getExpenses(groupId: string): Promise<ExpenseDocument[]> {
    const groupUsers = await this.userService.getUsersByGroupId(groupId);
    const groupUsersIds = groupUsers.map((user) => user._id);
    const expenses = await this.expenseModel
      .find({ createdBy: { $in: groupUsersIds } })
      .populate('shop')
      .populate('createdBy');
    return expenses;
  }

  async getExpense(id: string): Promise<ExpenseDocument> {
    const expense = await this.expenseModel
      .findById(id)
      .populate('shop')
      .populate('createdBy');
    return expense;
  }

  async deleteExpense(id: string): Promise<ExpenseDocument> {
    const expense = await this.expenseModel.findByIdAndDelete(id);
    return expense;
  }

  async getExpensesByUserId(userId: string): Promise<ExpenseDocument[]> {
    const expenses = await this.expenseModel
      .find({ createdBy: userId })
      .populate('shop')
      .populate('createdBy');
    return expenses;
  }

  async getExpensesByShop(
    shopId: string,
    groupId: string,
  ): Promise<ExpenseDocument[]> {
    const allExpenses = await this.getExpenses(groupId);
    const expenses = allExpenses.filter(
      (expense) => expense?.shop?._id == shopId,
    );
    return expenses;
  }

  async getExpensesByCategory(groupId: string) {
    const allExpenses = await this.getExpenses(groupId);
    const sumByCategory: { [key: string]: ExpenseDocument[] } = {};
    allExpenses.forEach((expense) => {
      if (!sumByCategory[expense.shop.category]) {
        sumByCategory[expense.shop.category] = [expense];
      } else {
        sumByCategory[expense.shop.category].push(expense);
      }
    });
    return sumByCategory;
  }

  async getExpensesByUser(groupId: string) {
    const allExpenses = await this.getExpenses(groupId);
    const sumByUser: { [key: string]: ExpenseDocument[] } = {};
    allExpenses.forEach((expense) => {
      if (!sumByUser[expense.createdBy._id]) {
        sumByUser[expense.createdBy._id] = [expense];
      } else {
        sumByUser[expense.createdBy._id].push(expense);
      }
    });
    return sumByUser;
  }
}
