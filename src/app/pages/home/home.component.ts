import { Component, Input, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../templates/header/header.component';
import { ConectividadComponent } from '../conectividad/conectividad.component';
import { EstatusComponent } from '../estatus/estatus.component';
import { ConfiguracionesComponent } from '../configuraciones/configuraciones.component';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { EncryptService } from '../../services/encrypt.service';
import { PoolsComponent } from '../pools/pools.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    ConectividadComponent,
    EstatusComponent,
    ConfiguracionesComponent,
    CommonModule,
    HttpClientModule,
    PoolsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnDestroy {
  private menuSubscription: Subscription;
  public hasClickedMenu: boolean = true;
  notificaciones: any[] = [];
  constructor(
    private http: HttpClient,
    private router: Router,
    private service: EncryptService
  ) {
    this.GetUser();
    this.menuSubscription = this.service.menuClick$.subscribe(() => {
      this.hasClickedMenu = !this.hasClickedMenu;
    });
    this.service.getNotificaciones().subscribe({
      next: (res) => {
        this.notificaciones = res.slice().reverse();
      },
      error: (error) => {
        console.log(error.error);
      },
    });
  }

  ngOnDestroy(): void {
    this.menuSubscription.unsubscribe();
  }

  private apiUrl = 'http://127.0.0.1:8000/api';
  data: any;
  vista: string = 'Conectividad';

  GetUser() {
    const authToken = this.service.getDecryptedToken();
    const correo = this.service.getDecryptedEmail();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    });

    this.http.get<any>(`${this.apiUrl}/user/${correo}`, { headers }).subscribe({
      next: (res) => {
        if (res.exito == 1) {
          this.data = res.data;
        } else {
          localStorage.removeItem('tk');
          localStorage.removeItem('correo');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        localStorage.removeItem('tk');
        localStorage.removeItem('correo');
        this.router.navigate(['/login']);
      },
    });
  }

  logout() {
    const authToken = this.service.getDecryptedToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    });

    this.http.get<any>(`${this.apiUrl}/logout`, { headers }).subscribe({
      next: (res) => {
        localStorage.removeItem('tk');
        localStorage.removeItem('correo');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  changeEstatus() {
    this.vista = 'Estatus';
  }

  changePools() {
    this.vista = 'Pools & Eventos';
  }

  changeConectividad() {
    this.vista = 'Conectividad';
  }

  changeConfiguraciones() {
    this.vista = 'Configuraciones';
  }
}
