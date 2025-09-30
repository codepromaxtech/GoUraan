"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersResolver = exports.UpdateUserPreferencesInput = exports.UpdateUserInput = exports.UserStatsType = exports.UserType = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const graphql_2 = require("@nestjs/graphql");
let UserType = class UserType {
};
exports.UserType = UserType;
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], UserType.prototype, "id", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], UserType.prototype, "email", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], UserType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], UserType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "phone", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "avatar", void 0);
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", String)
], UserType.prototype, "role", void 0);
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", String)
], UserType.prototype, "status", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], UserType.prototype, "emailVerified", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], UserType.prototype, "phoneVerified", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], UserType.prototype, "loyaltyPoints", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Date)
], UserType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Date)
], UserType.prototype, "updatedAt", void 0);
exports.UserType = UserType = __decorate([
    (0, graphql_2.ObjectType)()
], UserType);
let UserStatsType = class UserStatsType {
};
exports.UserStatsType = UserStatsType;
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], UserStatsType.prototype, "totalBookings", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], UserStatsType.prototype, "completedBookings", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], UserStatsType.prototype, "totalSpent", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], UserStatsType.prototype, "loyaltyPoints", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], UserStatsType.prototype, "walletBalance", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], UserStatsType.prototype, "walletCurrency", void 0);
exports.UserStatsType = UserStatsType = __decorate([
    (0, graphql_2.ObjectType)()
], UserStatsType);
let UpdateUserInput = class UpdateUserInput {
};
exports.UpdateUserInput = UpdateUserInput;
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "email", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "avatar", void 0);
exports.UpdateUserInput = UpdateUserInput = __decorate([
    (0, graphql_2.InputType)()
], UpdateUserInput);
let UpdateUserPreferencesInput = class UpdateUserPreferencesInput {
};
exports.UpdateUserPreferencesInput = UpdateUserPreferencesInput;
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserPreferencesInput.prototype, "language", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserPreferencesInput.prototype, "currency", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserPreferencesInput.prototype, "timezone", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesInput.prototype, "emailNotifications", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesInput.prototype, "smsNotifications", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesInput.prototype, "pushNotifications", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesInput.prototype, "marketingEmails", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserPreferencesInput.prototype, "seatPreference", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserPreferencesInput.prototype, "mealPreference", void 0);
__decorate([
    (0, graphql_2.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateUserPreferencesInput.prototype, "specialAssistance", void 0);
exports.UpdateUserPreferencesInput = UpdateUserPreferencesInput = __decorate([
    (0, graphql_2.InputType)()
], UpdateUserPreferencesInput);
let UsersResolver = class UsersResolver {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async me(user) {
        return this.usersService.findById(user.id);
    }
    async updateProfile(user, input) {
        return this.usersService.updateProfile(user.id, input);
    }
    async updatePreferences(user, input) {
        await this.usersService.updatePreferences(user.id, input);
        return 'Preferences updated successfully';
    }
    async userStats(user) {
        return this.usersService.getUserStats(user.id);
    }
    async deactivateAccount(user) {
        return this.usersService.deactivateAccount(user.id);
    }
    async user(id) {
        return this.usersService.findById(id);
    }
    async updateUserStatus(id, status) {
        return this.usersService.updateUserStatus(id, status);
    }
};
exports.UsersResolver = UsersResolver;
__decorate([
    (0, graphql_1.Query)(() => UserType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "me", null);
__decorate([
    (0, graphql_1.Mutation)(() => UserType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateUserInput]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "updateProfile", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateUserPreferencesInput]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "updatePreferences", null);
__decorate([
    (0, graphql_1.Query)(() => UserStatsType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "userStats", null);
__decorate([
    (0, graphql_1.Mutation)(() => UserType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "deactivateAccount", null);
__decorate([
    (0, graphql_1.Query)(() => UserType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_SUPPORT),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "user", null);
__decorate([
    (0, graphql_1.Mutation)(() => UserType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "updateUserStatus", null);
exports.UsersResolver = UsersResolver = __decorate([
    (0, graphql_1.Resolver)(() => UserType),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersResolver);
//# sourceMappingURL=users.resolver.js.map