import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { FlightBookingListComponent } from './flight-booking-list/flight-booking-list.component';
import { FlightBookingFormComponent } from './flight-booking-form/flight-booking-form.component';
import { FlightBookingService } from '../../services/flight-booking.service';
import { SharedModule } from '../../shared/shared.module';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: FlightBookingListComponent,
    data: { title: 'Flight Bookings' }
  },
  {
    path: 'new',
    component: FlightBookingFormComponent,
    data: { title: 'New Flight Booking' }
  },
  {
    path: ':id',
    component: FlightBookingFormComponent,
    data: { title: 'Edit Flight Booking' }
  }
];

@NgModule({
  declarations: [
    FlightBookingListComponent,
    FlightBookingFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    
    // Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatMenuModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatChipsModule,
    MatAutocompleteModule,
    
    // Shared Module
    SharedModule
  ],
  providers: [
    FlightBookingService
  ],
  entryComponents: [
    FlightBookingFormComponent,
    ConfirmDialogComponent
  ]
})
export class FlightBookingsModule { }
