import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Modules
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
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Components
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { ErrorMessageComponent } from './error-message/error-message.component';

// Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ScrollToTopDirective } from './directives/scroll-to-top.directive';

// Pipes
import { CurrencyPipe, DateAgoPipe, FilterPipe, SafeHtmlPipe, TruncatePipe } from './pipes';

const materialModules = [
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
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatExpansionModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatProgressBarModule
];

const sharedComponents = [
  ConfirmDialogComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  ErrorMessageComponent
];

const sharedPipes = [
  CurrencyPipe,
  DateAgoPipe,
  FilterPipe,
  SafeHtmlPipe,
  TruncatePipe
];

const sharedDirectives = [
  ClickOutsideDirective,
  ScrollToTopDirective
];

@NgModule({
  declarations: [
    ...sharedComponents,
    ...sharedPipes,
    ...sharedDirectives
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ...materialModules
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ...materialModules,
    ...sharedComponents,
    ...sharedPipes,
    ...sharedDirectives
  ],
  providers: [
    // Add any services that should be singletons across the app
  ]
})
export class SharedModule { }
