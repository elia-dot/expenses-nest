export class UpdateUserDto {
    name: string;
    phone: string;
    password: string;
    isPasswordConfirm: boolean;
    groupId: string;
    isAdmin: boolean;
}