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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(user) {
        return this.usersService.findById(user.id);
    }
    async updateProfile(user, updateUserDto) {
        return this.usersService.updateProfile(user.id, updateUserDto);
    }
    async updatePreferences(user, updatePreferencesDto) {
        return this.usersService.updatePreferences(user.id, updatePreferencesDto);
    }
    async getBookingHistory(user, page, limit) {
        return this.usersService.getBookingHistory(user.id, page, limit);
    }
    async getWalletTransactions(user, page, limit) {
        return this.usersService.getWalletTransactions(user.id, page, limit);
    }
    async getLoyaltyTransactions(user, page, limit) {
        return this.usersService.getLoyaltyTransactions(user.id, page, limit);
    }
    async getUserStats(user) {
        return this.usersService.getUserStats(user.id);
    }
    async deactivateAccount(user) {
        return this.usersService.deactivateAccount(user.id);
    }
    async getAllUsers(page, limit, role, status, search) {
        return this.usersService.getAllUsers(page, limit, { role, status, search });
    }
    async getUserById(id) {
        return this.usersService.findById(id);
    }
    async updateUserStatus(id, status) {
        return this.usersService.updateUserStatus(id, status);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Preferences updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateUserPreferencesDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user booking history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBookingHistory", null);
__decorate([
    (0, common_1.Get)('wallet'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet and transaction history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet information retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getWalletTransactions", null);
__decorate([
    (0, common_1.Get)('loyalty'),
    (0, swagger_1.ApiOperation)({ summary: 'Get loyalty points transaction history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Loyalty transactions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getLoyaltyTransactions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Put)('deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deactivateAccount", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_SUPPORT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: client_1.UserRole }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.UserStatus }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_SUPPORT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserStatus", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map