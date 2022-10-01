export class UpdateUserDto {
    name: string;
    email: string;
    password: string;
    isPasswordConfirm: boolean;
    currentPassword: string;
    groupId: string;
    isAdmin: boolean;
    monthlyBudget: number;
    allowNotifications: boolean;
}