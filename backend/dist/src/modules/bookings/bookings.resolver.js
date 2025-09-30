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
exports.BookingsResolver = exports.UpdateBookingInput = exports.CreateBookingInput = exports.BookingStatsType = exports.BookingGQLType = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const graphql_2 = require("@nestjs/graphql");
let BookingGQLType = class BookingGQLType {
};
exports.BookingGQLType = BookingGQLType;
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], BookingGQLType.prototype, "id", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], BookingGQLType.prototype, "userId", void 0);
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", String)
], BookingGQLType.prototype, "type", void 0);
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", String)
], BookingGQLType.prototype, "status", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], BookingGQLType.prototype, "reference", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], BookingGQLType.prototype, "totalAmount", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], BookingGQLType.prototype, "currency", void 0);
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", String)
], BookingGQLType.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", Object)
], BookingGQLType.prototype, "bookingData", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingGQLType.prototype, "notes", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Date)
], BookingGQLType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Date)
], BookingGQLType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Date)
], BookingGQLType.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Date)
], BookingGQLType.prototype, "confirmedAt", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Date)
], BookingGQLType.prototype, "cancelledAt", void 0);
exports.BookingGQLType = BookingGQLType = __decorate([
    (0, graphql_2.ObjectType)()
], BookingGQLType);
let BookingStatsType = class BookingStatsType {
};
exports.BookingStatsType = BookingStatsType;
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], BookingStatsType.prototype, "totalBookings", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], BookingStatsType.prototype, "pendingBookings", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], BookingStatsType.prototype, "confirmedBookings", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], BookingStatsType.prototype, "completedBookings", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], BookingStatsType.prototype, "cancelledBookings", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], BookingStatsType.prototype, "totalRevenue", void 0);
exports.BookingStatsType = BookingStatsType = __decorate([
    (0, graphql_2.ObjectType)()
], BookingStatsType);
let CreateBookingInput = class CreateBookingInput {
};
exports.CreateBookingInput = CreateBookingInput;
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", String)
], CreateBookingInput.prototype, "type", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], CreateBookingInput.prototype, "totalAmount", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateBookingInput.prototype, "currency", void 0);
__decorate([
    (0, graphql_2.Field)(() => String),
    __metadata("design:type", Object)
], CreateBookingInput.prototype, "bookingData", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateBookingInput.prototype, "notes", void 0);
exports.CreateBookingInput = CreateBookingInput = __decorate([
    (0, graphql_2.InputType)()
], CreateBookingInput);
let UpdateBookingInput = class UpdateBookingInput {
};
exports.UpdateBookingInput = UpdateBookingInput;
__decorate([
    (0, graphql_2.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateBookingInput.prototype, "status", void 0);
__decorate([
    (0, graphql_2.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateBookingInput.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBookingInput.prototype, "totalAmount", void 0);
__decorate([
    (0, graphql_2.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], UpdateBookingInput.prototype, "bookingData", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateBookingInput.prototype, "notes", void 0);
exports.UpdateBookingInput = UpdateBookingInput = __decorate([
    (0, graphql_2.InputType)()
], UpdateBookingInput);
let BookingsResolver = class BookingsResolver {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async createBooking(user, input) {
        return this.bookingsService.createBooking(user.id, input);
    }
    async myBookings(user, page, limit) {
        const result = await this.bookingsService.getUserBookings(user.id, page, limit);
        return result.bookings;
    }
    async booking(user, id) {
        return this.bookingsService.findById(id, user.id);
    }
    async bookingByReference(user, reference) {
        return this.bookingsService.findByReference(reference, user.id);
    }
    async updateBooking(user, id, input) {
        return this.bookingsService.updateBooking(id, input, user.id);
    }
    async confirmBooking(user, id) {
        return this.bookingsService.confirmBooking(id, user.id);
    }
    async cancelBooking(user, id, reason) {
        return this.bookingsService.cancelBooking(id, reason, user.id);
    }
    async myBookingStats(user) {
        return this.bookingsService.getBookingStats(user.id);
    }
    async allBookings(page, limit) {
        const result = await this.bookingsService.getAllBookings(page, limit);
        return result.bookings;
    }
    async bookingStats() {
        return this.bookingsService.getBookingStats();
    }
};
exports.BookingsResolver = BookingsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => BookingGQLType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateBookingInput]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "createBooking", null);
__decorate([
    (0, graphql_1.Query)(() => [BookingGQLType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, defaultValue: 1 })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "myBookings", null);
__decorate([
    (0, graphql_1.Query)(() => BookingGQLType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "booking", null);
__decorate([
    (0, graphql_1.Query)(() => BookingGQLType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "bookingByReference", null);
__decorate([
    (0, graphql_1.Mutation)(() => BookingGQLType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id')),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateBookingInput]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "updateBooking", null);
__decorate([
    (0, graphql_1.Mutation)(() => BookingGQLType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "confirmBooking", null);
__decorate([
    (0, graphql_1.Mutation)(() => BookingGQLType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id')),
    __param(2, (0, graphql_1.Args)('reason', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "cancelBooking", null);
__decorate([
    (0, graphql_1.Query)(() => BookingStatsType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "myBookingStats", null);
__decorate([
    (0, graphql_1.Query)(() => [BookingGQLType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_OPERATIONS, client_1.UserRole.STAFF_SUPPORT),
    __param(0, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, defaultValue: 1 })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "allBookings", null);
__decorate([
    (0, graphql_1.Query)(() => BookingStatsType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_OPERATIONS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsResolver.prototype, "bookingStats", null);
exports.BookingsResolver = BookingsResolver = __decorate([
    (0, graphql_1.Resolver)(() => BookingGQLType),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsResolver);
//# sourceMappingURL=bookings.resolver.js.map