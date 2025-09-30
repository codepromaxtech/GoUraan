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
exports.CreateBookingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateBookingDto {
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.BookingType.FLIGHT,
        description: 'Type of booking',
        enum: client_1.BookingType,
    }),
    (0, class_validator_1.IsEnum)(client_1.BookingType),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1500.00,
        description: 'Total booking amount',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.Currency.USD,
        description: 'Currency of the booking',
        enum: client_1.Currency,
        default: client_1.Currency.USD,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Currency),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            flights: [
                {
                    flightNumber: 'EK123',
                    departure: 'DAC',
                    arrival: 'DXB',
                    departureTime: '2024-01-15T10:00:00Z',
                    arrivalTime: '2024-01-15T14:00:00Z'
                }
            ],
            passengers: [
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    type: 'ADULT',
                    passportNumber: 'AB123456'
                }
            ]
        },
        description: 'Booking specific data (varies by booking type)',
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateBookingDto.prototype, "bookingData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Special dietary requirements',
        description: 'Additional notes for the booking',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "notes", void 0);
//# sourceMappingURL=create-booking.dto.js.map