import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanel {
  constructor(private router: Router) {}

  go(route: string) {
    this.router.navigate([`/${route}`]);
  }
}