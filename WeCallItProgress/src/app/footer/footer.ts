import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  currentYear: number = new Date().getFullYear();
  
  teamMembers = [
    { name: 'Maria Cristina T. Perido', role: 'Project Lead'},
    { name: 'Jan Mykel B. Singilan', role: 'UI Developer'},
    { name: 'Leonard L. Sagudin', role: 'Data Engineer'}
  ];
}