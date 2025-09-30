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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateBookingDto {
}
exports.UpdateBookingDto = UpdateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.BookingStatus.CONFIRMED,
        description: 'Booking status',
        enum: client_1.BookingStatus,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.PaymentStatus.PAID,
        description: 'Payment status',
        enum: client_1.PaymentStatus,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1600.00,
        description: 'Updated total amount',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateBookingDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            flights: [
                {
                    flightNumber: 'EK124',
                    departure: 'DAC',
                    arrival: 'DXB',
                    departureTime: '2024-01-16T10:00:00Z',
                    arrivalTime: '2024-01-16T14:00:00Z'
                }
            ]
        },
        description: 'Updated booking data',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateBookingDto.prototype, "bookingData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Updated special requirements',
        description: 'Updated notes',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "notes", void 0);
//# sourceMappingURL=update-booking.dto.js.map