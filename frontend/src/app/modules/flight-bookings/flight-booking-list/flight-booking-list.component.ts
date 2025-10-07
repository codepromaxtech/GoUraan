import { Component, OnInit, ViewChild } from '@angular/core';
import { FlightBookingService } from '../../../services/flight-booking.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FlightBookingFormComponent } from '../flight-booking-form/flight-booking-form.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-flight-booking-list',
  templateUrl: './flight-booking-list.component.html',
  styleUrls: ['./flight-booking-list.component.scss']
})
export class FlightBookingListComponent implements OnInit {
  displayedColumns: string[] = [
    'bookingId',
    'pnr',
    'bookingDate',
    'passengers',
    'flightSegments',
    'totalFare',
    'status',
    'actions'
  ];
  
  dataSource: MatTableDataSource<any>;
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  // Filters
  statusFilter: string = '';
  dateFrom: Date;
  dateTo: Date;
  searchTerm: string = '';

  constructor(
    private flightBookingService: FlightBookingService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    
    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      sortBy: this.sort?.active || 'bookingDate',
      sortOrder: this.sort?.direction || 'desc'
    };
    
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.dateFrom) params.startDate = this.formatDate(this.dateFrom);
    if (this.dateTo) params.endDate = this.formatDate(this.dateTo);
    if (this.searchTerm) params.search = this.searchTerm;

    this.flightBookingService.getBookings(params).subscribe({
      next: (response: any) => {
        this.dataSource = new MatTableDataSource(response.data);
        this.totalItems = response.meta.totalItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBookings();
  }

  onSortChange(event: any) {
    this.loadBookings();
  }

  applyFilters() {
    this.pageIndex = 0;
    this.loadBookings();
  }

  resetFilters() {
    this.statusFilter = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  openBookingForm(booking?: any) {
    const dialogRef = this.dialog.open(FlightBookingFormComponent, {
      width: '800px',
      data: { booking }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBookings();
      }
    });
  }

  deleteBooking(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Booking',
        message: 'Are you sure you want to delete this booking?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.flightBookingService.deleteBooking(id).subscribe({
          next: () => {
            this.loadBookings();
          },
          error: (error) => {
            console.error('Error deleting booking:', error);
          }
        });
      }
    });
  }

  exportToExcel() {
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.dateFrom) params.startDate = this.formatDate(this.dateFrom);
    if (this.dateTo) params.endDate = this.formatDate(this.dateTo);
    if (this.searchTerm) params.search = this.searchTerm;

    this.flightBookingService.exportBookings(params).subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `flight-bookings-${new Date().toISOString()}.xlsx`);
      },
      error: (error) => {
        console.error('Error exporting bookings:', error);
      }
    });
  }

  viewBookingDetails(booking: any) {
    // Navigate to booking details or open in a dialog
    console.log('View booking:', booking);
    // this.router.navigate(['/bookings', booking.id]);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
