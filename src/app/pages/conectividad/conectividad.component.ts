import { Component, ViewChild } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { Subject, Subscription } from 'rxjs';
import { EncryptService } from '../../services/encrypt.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

export interface ConectityElements {
  position: number;
  estado_conectate: any;
  velocidad_conectate: any;
  estado_itelkom: any;
  velocidad_itelkom: any;
  alertas_graves: any;
  observaciones_graves: any;
  alertas_medias: any;
  observaciones_medias: any;
  alertas_menores: any;
  observaciones_menores: any;
  alertas_totales: any;
  informacion_workspace: any;
  pico_entrante_max_itelkom: any;
  pico_salida_max_itelkom: any;
  pico_entrante_max_conectate: any;
  pico_salida_max_conectate: any;
  temperatura_datacenter: any;
  registrado_por: any;
  v_fisica_1: any;
  v_fisica_2: any;
  created_at: any;
  aprobado_por: any;
}

@Component({
  selector: 'app-conectividad',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: ConectividadComponent }],
  templateUrl: './conectividad.component.html',
  styleUrl: './conectividad.component.css',
})
export class ConectividadComponent implements MatPaginatorIntl {
  // MatPaginatorIntl
  changes = new Subject<void>();
  firstPageLabel = $localize`Primera Página`;
  itemsPerPageLabel = $localize`Items por página:`;
  lastPageLabel = $localize`Última Página`;
  nextPageLabel = 'Siguiente Página';
  previousPageLabel = 'Página Anterior';
  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return $localize`Página 1 de 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return $localize`Página ${page + 1} de ${amountPages}`;
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  //Variables
  displayedColumns: string[] = [
    'position',
    'Estado Conectate',
    'Velocidad Conectate',
    'Estado Itelkom',
    'Velocidad Itelkom',
    'Alertas Graves',
    'Observaciones Graves',
    'Alertas Medias',
    'Observaciones Medias',
    'Alertas Menores',
    'Observaciones Menores',
    'Alertas Totales',
    'Workspace',
    'I - Pico Entrante Max',
    'I - Pico Salida Max',
    'C - Pico Entrante Max',
    'C - Pico Salida Max',
    'Temp Datacenter',
    'Verificación 1',
    'Verificación 2',
    'Regístrado Por',
    'Fecha Registro',
    'Aprobado Por',
  ];
  dataSource: any;
  user: any;
  conectividades: any;
  dataCargada: boolean = false;
  public archivo1: any;
  public archivo2: any;
  public previsualizacion: string;
  public previsualizacion2: string;
  modal: boolean = false;
  success = false;
  private menuSubscription: Subscription;
  public hasClickedMenu: boolean = true;
  public baseUrl = 'http://127.0.0.1:8000';
  private conectividadUrl = 'http://127.0.0.1:8000/api/conectividad';
  conectsForm = new FormGroup({
    estado_conectate: new FormControl('', [Validators.required]),
    velocidad_conectate: new FormControl('', [Validators.required]),
    estado_itelkom: new FormControl('', [Validators.required]),
    velocidad_itelkom: new FormControl('', [Validators.required]),
    alertas_graves: new FormControl(null, [Validators.required]),
    observaciones_graves: new FormControl(null, [Validators.required]),
    alertas_medias: new FormControl('', [Validators.required]),
    observaciones_medias: new FormControl('', [Validators.required]),
    alertas_menores: new FormControl('', [Validators.required]),
    observaciones_menores: new FormControl('', [Validators.required]),
    alertas_totales: new FormControl('', [Validators.required]),
    informacion_workspace: new FormControl(null, [Validators.required]),
    pico_entrante_max_itelkom: new FormControl(null, [Validators.required]),
    pico_salida_max_itelkom: new FormControl('', [Validators.required]),
    pico_entrante_max_conectate: new FormControl(null, [Validators.required]),
    pico_salida_max_conectate: new FormControl('', [Validators.required]),
    temperatura_datacenter: new FormControl('', [Validators.required]),
    v_fisica_1: new FormControl('', [Validators.required]),
    v_fisica_2: new FormControl('', [Validators.required]),
    registrado_por: new FormControl(null, [Validators.required]),
    created_at: new FormControl('', [Validators.required]),
    aprobado_por: new FormControl('', [Validators.required]),
  });

  constructor(
    private service: EncryptService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.service.getUser().subscribe({
      next: (res) => {
        this.user = res.data;
        this.GetConectitys();
      },
      error: (error) => {
        console.log(error.error.error);
      },
    });
    this.menuSubscription = this.service.menuClick$.subscribe(() => {
      this.hasClickedMenu = !this.hasClickedMenu;
    });
  }

  GetConectitys() {
    const authToken = this.service.getDecryptedToken();
    if (this.user) {
      this.conectsForm.get('registrado_por')?.setValue(this.user.name);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    });

    this.http
      .get<ConectityElements[]>(`${this.conectividadUrl}`, { headers })
      .subscribe({
        next: (res) => {
          if (res) {
            this.conectividades = res;

            var ELEMENT_DATA: ConectityElements[] = [];
            for (let i = 0; i < res.length; i++) {
              const item = res[i];
              item.position = i + 1;
              ELEMENT_DATA.push(item);
            }
            ELEMENT_DATA.sort((a, b) => {
              const dateA: Date = new Date(a.created_at);
              const dateB: Date = new Date(b.created_at);
              return dateB.getTime() - dateA.getTime();
            });

            //this.dataPoolService.setDataPools(res);
            this.dataSource = new MatTableDataSource<ConectityElements>(
              ELEMENT_DATA
            );
            this.dataSource.paginator = this.paginator;
            if (ELEMENT_DATA.length > 0) {
              this.dataCargada = true;
            }
          }
        },
        error: (error) => {
          console.log(error.error.error);
        },
      });
  }

  extraerBase64 = async ($event: any) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.readAsDataURL($event);

        reader.onload = () => {
          resolve({
            base: reader.result,
          });
        };

        reader.onerror = (error) => {
          resolve({
            base: null,
          });
        };
      });
    } catch (e) {
      return null;
    }
  };

  onConect() {}

  handleFileInput1(event: any): void {
    const archivoCapturadao = event.target.files[0];
    this.extraerBase64(archivoCapturadao).then((imagen: any) => {
      this.previsualizacion = imagen.base;
    });
    this.archivo1 = archivoCapturadao;
  }

  handleFileInput2(event: any): void {
    const archivoCapturado = event.target.files[0];
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.previsualizacion2 = imagen.base;
    });
    this.archivo2 = archivoCapturado;
  }

  getImageUrl(imagePath: string): string {
    return `${this.baseUrl}/storage/${imagePath}`;
  }

  activeModal() {
    this.modal = true;
  }
  desactiveModal() {
    this.modal = false;
    this.GetConectitys();
  }
}
