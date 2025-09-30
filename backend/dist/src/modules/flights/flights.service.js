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
var FlightsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const amadeus_service_1 = require("./services/amadeus.service");
const sabre_service_1 = require("./services/sabre.service");
let FlightsService = FlightsService_1 = class FlightsService {
    constructor(prisma, configService, amadeusService, sabreService) {
        this.prisma = prisma;
        this.configService = configService;
        this.amadeusService = amadeusService;
        this.sabreService = sabreService;
        this.logger = new common_1.Logger(FlightsService_1.name);
    }
    async searchFlights(searchDto) {
        const { origin, destination, departureDate, returnDate, passengers, cabinClass, tripType, } = searchDto;
        try {
            const [amadeusResults, sabreResults] = await Promise.allSettled([
                this.amadeusService.searchFlights({
                    origin,
                    destination,
                    departureDate,
                    returnDate,
                    passengers,
                    cabinClass,
                    tripType,
                }),
                this.sabreService.searchFlights({
                    origin,
                    destination,
                    departureDate,
                    returnDate,
                    passengers,
                    cabinClass,
                    tripType,
                }),
            ]);
            const flights = [];
            if (amadeusResults.status === 'fulfilled') {
                flights.push(...amadeusResults.value.flights);
            }
            if (sabreResults.status === 'fulfilled') {
                flights.push(...sabreResults.value.flights);
            }
            flights.sort((a, b) => a.price - b.price);
            const flightsWithMarkup = flights.map(flight => ({
                ...flight,
                originalPrice: flight.price,
                price: this.addMarkup(flight.price, 'FLIGHT'),
            }));
            return {
                flights: flightsWithMarkup,
                searchId: this.generateSearchId(),
                totalResults: flights.length,
                providers: ['Amadeus', 'Sabre'],
            };
        }
        catch (error) {
            this.logger.error('Flight search failed', error);
            throw new common_1.BadRequestException('Flight search failed');
        }
    }
    async getFlightDetails(flightId, provider) {
        try {
            switch (provider.toLowerCase()) {
                case 'amadeus':
                    return await this.amadeusService.getFlightDetails(flightId);
                case 'sabre':
                    return await this.sabreService.getFlightDetails(flightId);
                default:
                    throw new common_1.BadRequestException('Unsupported flight provider');
            }
        }
        catch (error) {
            this.logger.error('Failed to get flight details', error);
            throw new common_1.BadRequestException('Failed to get flight details');
        }
    }
    async bookFlight(userId, bookingDto) {
        const { flightId, provider, passengers, contactInfo, paymentInfo, } = bookingDto;
        try {
            const flightDetails = await this.getFlightDetails(flightId, provider);
            const totalPrice = this.calculateTotalPrice(flightDetails, passengers);
            const booking = await this.prisma.booking.create({
                data: {
                    userId,
                    type: 'FLIGHT',
                    reference: this.generateBookingReference('FL'),
                    totalAmount: totalPrice,
                    currency: flightDetails.currency,
                    bookingData: {
                        flight: flightDetails,
                        passengers,
                        contactInfo,
                        provider,
                    },
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                },
            });
            let reservationResult;
            switch (provider.toLowerCase()) {
                case 'amadeus':
                    reservationResult = await this.amadeusService.reserveFlight({
                        flightId,
                        passengers,
                        contactInfo,
                        bookingReference: booking.reference,
                    });
                    break;
                case 'sabre':
                    reservationResult = await this.sabreService.reserveFlight({
                        flightId,
                        passengers,
                        contactInfo,
                        bookingReference: booking.reference,
                    });
                    break;
                default:
                    throw new common_1.BadRequestException('Unsupported flight provider');
            }
            await this.prisma.booking.update({
                where: { id: booking.id },
                data: {
                    bookingData: {
                        ...booking.bookingData,
                        reservation: reservationResult,
                    },
                },
            });
            this.logger.log(`Flight booking created: ${booking.reference}`);
            return booking;
        }
        catch (error) {
            this.logger.error('Flight booking failed', error);
            throw new common_1.BadRequestException('Flight booking failed');
        }
    }
    async confirmFlightBooking(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            throw new common_1.BadRequestException('Booking not found');
        }
        const { provider, reservation } = booking.bookingData;
        try {
            let confirmationResult;
            switch (provider.toLowerCase()) {
                case 'amadeus':
                    confirmationResult = await this.amadeusService.confirmBooking(reservation.pnr);
                    break;
                case 'sabre':
                    confirmationResult = await this.sabreService.confirmBooking(reservation.pnr);
                    break;
                default:
                    throw new common_1.BadRequestException('Unsupported flight provider');
            }
            await this.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CONFIRMED',
                    confirmedAt: new Date(),
                    bookingData: {
                        ...booking.bookingData,
                        confirmation: confirmationResult,
                    },
                },
            });
            await this.generateETicket(bookingId);
            this.logger.log(`Flight booking confirmed: ${booking.reference}`);
            return confirmationResult;
        }
        catch (error) {
            this.logger.error('Flight booking confirmation failed', error);
            throw new common_1.BadRequestException('Flight booking confirmation failed');
        }
    }
    async cancelFlightBooking(bookingId, reason) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            throw new common_1.BadRequestException('Booking not found');
        }
        const { provider, reservation } = booking.bookingData;
        try {
            let cancellationResult;
            switch (provider.toLowerCase()) {
                case 'amadeus':
                    cancellationResult = await this.amadeusService.cancelBooking(reservation.pnr, reason);
                    break;
                case 'sabre':
                    cancellationResult = await this.sabreService.cancelBooking(reservation.pnr, reason);
                    break;
                default:
                    throw new common_1.BadRequestException('Unsupported flight provider');
            }
            await this.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                    notes: reason,
                    bookingData: {
                        ...booking.bookingData,
                        cancellation: cancellationResult,
                    },
                },
            });
            this.logger.log(`Flight booking cancelled: ${booking.reference}`);
            return cancellationResult;
        }
        catch (error) {
            this.logger.error('Flight booking cancellation failed', error);
            throw new common_1.BadRequestException('Flight booking cancellation failed');
        }
    }
    async getFlightStatus(pnr, provider) {
        try {
            switch (provider.toLowerCase()) {
                case 'amadeus':
                    return await this.amadeusService.getFlightStatus(pnr);
                case 'sabre':
                    return await this.sabreService.getFlightStatus(pnr);
                default:
                    throw new common_1.BadRequestException('Unsupported flight provider');
            }
        }
        catch (error) {
            this.logger.error('Failed to get flight status', error);
            throw new common_1.BadRequestException('Failed to get flight status');
        }
    }
    addMarkup(price, type) {
        let markupPercentage = 0.05;
        if (type === 'FLIGHT') {
            if (price < 200)
                markupPercentage = 0.08;
            else if (price > 1000)
                markupPercentage = 0.03;
        }
        return Math.round(price * (1 + markupPercentage));
    }
    calculateTotalPrice(flight, passengers) {
        const basePrice = flight.price;
        const passengerCount = passengers.length;
        const taxes = flight.taxes || 0;
        const fees = flight.fees || 0;
        return (basePrice * passengerCount) + taxes + fees;
    }
    generateSearchId() {
        return `SEARCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateBookingReference(prefix) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }
    async generateETicket(bookingId) {
        this.logger.log(`E-ticket generation requested for booking: ${bookingId}`);
    }
    async getFlightBookings(page = 1, limit = 10, filters) {
        const skip = (page - 1) * limit;
        const where = { type: 'FLIGHT' };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.createdAt.lte = new Date(filters.dateTo);
            }
        }
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
            this.prisma.booking.count({ where }),
        ]);
        return {
            bookings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.FlightsService = FlightsService;
exports.FlightsService = FlightsService = FlightsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        amadeus_service_1.AmadeusService,
        sabre_service_1.SabreService])
], FlightsService);
//# sourceMappingURL=flights.service.js.map