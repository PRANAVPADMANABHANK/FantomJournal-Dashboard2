import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../service/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  // constructor(public dialog: MatDialog) { }
  userName: string | null = null;

  amount: number = 100; // Example amount
  mobileNumber: string = ''; // To store user's mobile number
  // orderId: string = 'order_' + Math.random().toString(36).substring(2, 15);

  constructor(private http: HttpClient, private apiService: ApiService,private router: Router) {}

  ngOnInit(): void {
    // Fetch the user's name from localStorage
    const userData = localStorage.getItem('user');
    console.log(userData, 'local userdata');

    if (userData) {
      const parsedUser = JSON.parse(userData);
      this.userName = parsedUser.name;
      this.mobileNumber = parsedUser.mobile; // Assuming mobile number is stored as 'mobile'
    }
  }

  initiatePayment() {
    const paymentData = {
      amount: this.amount,
      name: this.userName,
      mobile: this.mobileNumber,
    };

    this.apiService.payment(paymentData).subscribe({
      next: (response: any) => {
        console.log(response, 'response got');
        if (response && response.redirectUrl) {
          window.location.href = response.redirectUrl; // Redirect to PhonePe payment page
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error: any) => {
        console.error('Payment initiation failed:', error);
      },
    });
  }




  
  checkPaymentStatus(transactionId: string) {
    this.apiService.checkPaymentStatus(transactionId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.router.navigate(['/payment-success']);
        } else {
          this.router.navigate(['/payment-failed']);
        }
      },
      error: (error: any) => {
        console.error('Error checking payment status:', error);
        this.router.navigate(['/payment-failed']);
      }
    });
  }
  // openPaymentMethodDialog() {
  //   console.log("payment")
  //   const dialogRef = this.dialog.open(PaymentModalComponent);

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       // Handle the selected payment method
  //       console.log(`Payment method selected: ${result}`);
  //       // Redirect to the corresponding payment gateway based on the selected method
  //     }
  //   });
  // }
}
