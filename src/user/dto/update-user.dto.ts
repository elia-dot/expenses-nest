export class UpdateUserDto {
    name: string;
    email: string;
    password: string;
    isPasswordConfirm: boolean;
    groupId: string;
    isAdmin: boolean;
}