import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent {

 
  constructor(public dialogRef: MatDialogRef<PaymentModalComponent>) {}

  selectPayment(method: string) {
    // Logic to handle payment method selection
    console.log(`Selected payment method: ${method}`);
    // Close the dialog and pass the selected payment method
    this.dialogRef.close(method);
  }

}
