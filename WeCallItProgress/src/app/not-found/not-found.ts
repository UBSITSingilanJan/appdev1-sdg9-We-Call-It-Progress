import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css']
})
export class NotFound {
  constructor(public router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    window.history.back();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}