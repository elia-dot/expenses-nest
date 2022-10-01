import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserDocument } from '../user/schemas/user.schema';
import { ShopService } from '../shop/shop.service';
import { ExpenseDto } from './dto/create-expense.dto';
import { ExpenseDocument } from './schemas/expense.schema';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel('Expense') private expenseModel: Model<ExpenseDocument>,
    private shopService: ShopService,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  async getGroupTokens(groupId: string): Promise<string[]> {
    const groupUsers = await this.userService.getUsersByGroupId(groupId);
    const groupUsersTokens = groupUsers.map(
      (user) => user.pushNotificationsTokens,
    );
    return groupUsersTokens.flat();
  }

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

    const budget = user.monthlyBudget;
    const months = await this.getMonthlyExpenses(user.groupId);

    const sum =
      months[`${new Date().getMonth() + 1}-${new Date().getFullYear()}`].total;

    if (sum > budget) {
      const tokens = await this.getGroupTokens(user.groupId);
      for (let token of tokens) {
        this.notificationService.sendNotification(
          'תקציב חודשי חריג',
          `חריגה מהתקציב החודשי שלך בסך ${sum - budget} ש"ח`,
          token,
        );
      }
    }

    expense = await (await expense.populate('createdBy')).populate('shop');

    return expense;
  }

  async getExpenses(groupId: string): Promise<ExpenseDocument[]> {
    const groupUsers = await this.userService.getUsersByGroupId(groupId);
    const groupUsersIds = groupUsers.map((user) => user._id);
    const expenses = await this.expenseModel
      .find({ createdBy: { $in: groupUsersIds }, date: { $lte: new Date() } })
      .populate('shop')
      .populate('createdBy')
      .sort({ date: 1 });

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
    const sumByCategory: { [key: string]: number } = {};
    allExpenses.forEach((expense) => {
      if (!sumByCategory[expense.shop.category]) {
        sumByCategory[expense.shop.category] = expense.amount;
      } else {
        sumByCategory[expense.shop.category] += expense.amount;
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

  async getMonthlyExpenses(groupId: string) {
    const allExpenses = await this.getExpenses(groupId);
    const sumByMonth: { [key: string]: { [key: string]: number } } = {};
    allExpenses.forEach((expense) => {
      const month = `${
        expense.date.getMonth() + 1
      }-${expense.date.getFullYear()}`;
      const day = expense.date.getDate();

      if (!sumByMonth[month]) {
        sumByMonth[month] = {};
      }
      if (!sumByMonth[month][day]) {
        sumByMonth[month][day] = expense.amount;
      } else {
        sumByMonth[month][day] += expense.amount;
      }
      if (!sumByMonth[month].total) {
        sumByMonth[month].total = expense.amount;
      } else {
        sumByMonth[month].total += expense.amount;
      }
    });
    return sumByMonth;
  }
}
