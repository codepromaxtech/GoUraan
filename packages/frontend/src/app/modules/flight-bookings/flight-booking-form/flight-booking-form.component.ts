import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlightBookingService } from '../../../services/flight-booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-flight-booking-form',
  templateUrl: './flight-booking-form.component.html',
  styleUrls: ['./flight-booking-form.component.scss']
})
export class FlightBookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  isEdit = false;
  loading = false;
  minDate = new Date();

  // Form controls for better template access
  get flightSegments(): FormArray {
    return this.bookingForm.get('flightSegments') as FormArray;
  }

  get passengers(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private flightBookingService: FlightBookingService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<FlightBookingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.initForm();
    
    if (this.data?.booking) {
      this.isEdit = true;
      this.patchForm(this.data.booking);
    } else {
      // Add default segment and passenger for new booking
      this.addFlightSegment();
      this.addPassenger();
    }
  }

  private initForm() {
    this.bookingForm = this.fb.group({
      bookingId: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,20}$/)]],
      pnr: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6}$/)]],
      bookingDate: [new Date(), Validators.required],
      issueDate: [new Date(), Validators.required],
      issuedBy: ['', Validators.required],
      status: ['PENDING', Validators.required],
      flightSegments: this.fb.array([], Validators.required),
      passengers: this.fb.array([], Validators.required),
      baseFare: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.required, Validators.min(0)]],
      totalFare: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.required, Validators.min(0)]],
      customerPay: [0, [Validators.required, Validators.min(0)]],
      agencyPay: [0, [Validators.required, Validators.min(0)]],
      expense: [0, [Validators.required, Validators.min(0)]],
      profit: [0, [Validators.required, Validators.min(0)]],
      reference: ['']
    });

    // Calculate total fare when base fare or tax changes
    this.bookingForm.get('baseFare').valueChanges.subscribe(() => this.calculateTotalFare());
    this.bookingForm.get('tax').valueChanges.subscribe(() => this.calculateTotalFare());
    this.bookingForm.get('discount').valueChanges.subscribe(() => this.calculateTotalFare());
  }

  private patchForm(booking: any) {
    // Patch main booking data
    const bookingData = { ...booking };
    
    // Format dates
    bookingData.bookingDate = new Date(booking.bookingDate);
    bookingData.issueDate = new Date(booking.issueDate);
    
    // Patch flight segments
    if (booking.flightSegments && booking.flightSegments.length) {
      this.flightSegments.clear();
      booking.flightSegments.forEach(segment => {
        this.addFlightSegment(segment);
      });
    }
    
    // Patch passengers
    if (booking.passengers && booking.passengers.length) {
      this.passengers.clear();
      booking.passengers.forEach(passenger => {
        this.addPassenger(passenger);
      });
    }
    
    this.bookingForm.patchValue(bookingData);
  }

  // Flight Segment Methods
  addFlightSegment(segment?: any) {
    const segmentGroup = this.fb.group({
      flightNumber: [segment?.flightNumber || '', [Validators.required, Validators.pattern(/^[A-Z0-9]{2,3}\d{1,4}$/)]],
      airline: [segment?.airline || '', Validators.required],
      departureDate: [segment?.departureDate ? new Date(segment.departureDate) : null, Validators.required],
      departureTime: [segment?.departureTime || '12:00', Validators.required],
      departureAirport: [segment?.departureAirport || '', [Validators.required, Validators.maxLength(3)]],
      arrivalDate: [segment?.arrivalDate ? new Date(segment.arrivalDate) : null, Validators.required],
      arrivalTime: [segment?.arrivalTime || '12:00', Validators.required],
      arrivalAirport: [segment?.arrivalAirport || '', [Validators.required, Validators.maxLength(3)]],
      cabinClass: [segment?.cabinClass || 'ECONOMY', Validators.required],
      baggageAllowance: [segment?.baggageAllowance || '20KG']
    });

    this.flightSegments.push(segmentGroup);
  }

  removeFlightSegment(index: number) {
    this.flightSegments.removeAt(index);
  }

  // Passenger Methods
  addPassenger(passenger?: any) {
    const passengerGroup = this.fb.group({
      title: [passenger?.title || 'MR', Validators.required],
      firstName: [passenger?.firstName || '', [Validators.required, Validators.pattern(/^[a-zA-Z\s-']+$/)]],
      lastName: [passenger?.lastName || '', [Validators.required, Validators.pattern(/^[a-zA-Z\s-']+$/)]],
      dateOfBirth: [passenger?.dateOfBirth ? new Date(passenger.dateOfBirth) : null, Validators.required],
      gender: [passenger?.gender || 'MALE', Validators.required],
      passportNumber: [passenger?.passportNumber || '', Validators.pattern(/^[A-Z0-9]{6,20}$/)],
      nationality: [passenger?.nationality || '']
    });

    this.passengers.push(passengerGroup);
  }

  removePassenger(index: number) {
    this.passengers.removeAt(index);
  }

  // Form Submission
  onSubmit() {
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched(this.bookingForm);
      return;
    }

    this.loading = true;
    const formValue = this.prepareFormData(this.bookingForm.value);
    
    const request = this.isEdit
      ? this.flightBookingService.updateBooking(this.data.booking.id, formValue)
      : this.flightBookingService.createBooking(formValue);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Booking ${this.isEdit ? 'updated' : 'created'} successfully!`,
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving booking:', error);
        this.snackBar.open(
          `Failed to ${this.isEdit ? 'update' : 'create'} booking: ${error.message}`,
          'Close',
          { duration: 5000, panelClass: 'error-snackbar' }
        );
        this.loading = false;
      }
    });
  }

  private prepareFormData(formValue: any): any {
    const data = { ...formValue };
    
    // Format dates
    data.bookingDate = moment(data.bookingDate).format('YYYY-MM-DD');
    data.issueDate = moment(data.issueDate).format('YYYY-MM-DD');
    
    // Format flight segments
    data.flightSegments = data.flightSegments.map(segment => ({
      ...segment,
      departureDate: moment(segment.departureDate).format('YYYY-MM-DD'),
      arrivalDate: moment(segment.arrivalDate).format('YYYY-MM-DD')
    }));
    
    // Format passengers
    data.passengers = data.passengers.map(passenger => ({
      ...passenger,
      dateOfBirth: moment(passenger.dateOfBirth).format('YYYY-MM-DD')
    }));
    
    return data;
  }

  // Helper Methods
  private calculateTotalFare() {
    const baseFare = parseFloat(this.bookingForm.get('baseFare').value) || 0;
    const tax = parseFloat(this.bookingForm.get('tax').value) || 0;
    const discount = parseFloat(this.bookingForm.get('discount').value) || 0;
    
    const total = baseFare + tax - discount;
    this.bookingForm.patchValue({
      totalFare: total.toFixed(2),
      customerPay: total.toFixed(2)
    }, { emitEvent: false });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
