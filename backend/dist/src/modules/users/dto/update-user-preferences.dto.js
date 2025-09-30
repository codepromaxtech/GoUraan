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
exports.UpdateUserPreferencesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateUserPreferencesDto {
}
exports.UpdateUserPreferencesDto = UpdateUserPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.Language.EN,
        description: 'Preferred language',
        enum: client_1.Language,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Language),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.Currency.USD,
        description: 'Preferred currency',
        enum: client_1.Currency,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Currency),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'UTC',
        description: 'Preferred timezone',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Email notifications preference',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'SMS notifications preference',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesDto.prototype, "smsNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Push notifications preference',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesDto.prototype, "pushNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Marketing emails preference',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserPreferencesDto.prototype, "marketingEmails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.SeatPreference.AISLE,
        description: 'Preferred seat type',
        enum: client_1.SeatPreference,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SeatPreference),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "seatPreference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Vegetarian',
        description: 'Meal preference',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserPreferencesDto.prototype, "mealPreference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['wheelchair', 'extra_legroom'],
        description: 'Special assistance requirements',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateUserPreferencesDto.prototype, "specialAssistance", void 0);
//# sourceMappingURL=update-user-preferences.dto.js.map