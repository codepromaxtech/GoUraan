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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let BookingsController = class BookingsController {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async createBooking(user, createBookingDto) {
        return this.bookingsService.createBooking(user.id, createBookingDto);
    }
    async getUserBookings(user, page, limit, type, status, paymentStatus, dateFrom, dateTo) {
        return this.bookingsService.getUserBookings(user.id, page, limit, {
            type,
            status,
            paymentStatus,
            dateFrom,
            dateTo,
        });
    }
    async getUserBookingStats(user) {
        return this.bookingsService.getBookingStats(user.id);
    }
    async getBookingById(user, id) {
        return this.bookingsService.findById(id, user.id);
    }
    async getBookingByReference(user, reference) {
        return this.bookingsService.findByReference(reference, user.id);
    }
    async updateBooking(user, id, updateBookingDto) {
        return this.bookingsService.updateBooking(id, updateBookingDto, user.id);
    }
    async confirmBooking(user, id) {
        return this.bookingsService.confirmBooking(id, user.id);
    }
    async cancelBooking(user, id, reason) {
        return this.bookingsService.cancelBooking(id, reason, user.id);
    }
    async getAllBookings(page, limit, type, status, paymentStatus, userId, search, dateFrom, dateTo) {
        return this.bookingsService.getAllBookings(page, limit, {
            type,
            status,
            paymentStatus,
            userId,
            search,
            dateFrom,
            dateTo,
        });
    }
    async getBookingStats() {
        return this.bookingsService.getBookingStats();
    }
    async getAnyBookingById(id) {
        return this.bookingsService.findById(id);
    }
    async updateAnyBooking(id, updateBookingDto) {
        return this.bookingsService.updateBooking(id, updateBookingDto);
    }
    async completeBooking(id) {
        return this.bookingsService.completeBooking(id);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Booking created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user bookings' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: client_1.BookingType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.BookingStatus }),
    (0, swagger_1.ApiQuery)({ name: 'paymentStatus', required: false, enum: client_1.PaymentStatus }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: String, example: '2024-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: String, example: '2024-12-31' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('paymentStatus')),
    __param(6, (0, common_1.Query)('dateFrom')),
    __param(7, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getUserBookings", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user booking statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getUserBookingStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookingById", null);
__decorate([
    (0, common_1.Get)('reference/:reference'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by reference' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookingByReference", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateBooking", null);
__decorate([
    (0, common_1.Put)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking confirmed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - cannot confirm booking' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "confirmBooking", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - cannot cancel booking' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_OPERATIONS, client_1.UserRole.STAFF_SUPPORT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: client_1.BookingType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.BookingStatus }),
    (0, swagger_1.ApiQuery)({ name: 'paymentStatus', required: false, enum: client_1.PaymentStatus }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('paymentStatus')),
    __param(5, (0, common_1.Query)('userId')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('dateFrom')),
    __param(8, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getAllBookings", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_OPERATIONS),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookingStats", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_OPERATIONS, client_1.UserRole.STAFF_SUPPORT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get any booking by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getAnyBookingById", null);
__decorate([
    (0, common_1.Put)('admin/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_OPERATIONS),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update any booking (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateAnyBooking", null);
__decorate([
    (0, common_1.Put)('admin/:id/complete'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STAFF_OPERATIONS),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Complete booking (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "completeBooking", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('bookings'),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map