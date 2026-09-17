# Edge Security Dashboard

SaaS MVP de **Edge Cybersecurity Cloud** para consultar seguridad de red desde una interfaz web. Incluye Overview, Alerts, Devices y Services; métricas, filtros, estados de carga, errores y reintentos.

**Stack:** React + Vite, JavaScript, CSS simple y Node.js + Express con ES Modules. El frontend consulta los cinco endpoints del backend mediante `fetch`. Los datos simulados viven exclusivamente en `backend/src/data/`.

## Arquitectura de despliegue

El backend se conserva porque transforma eventos estilo Suricata y calcula el resumen. Producción usa dos imágenes pequeñas:

- **Frontend:** Vite compilado a archivos estáticos, servido por Nginx sin privilegios en `8080`; `/api` se reenvía a Express.
- **Backend:** Node.js + Express en el puerto interno `3001`, sin exposición directa a la LAN.

Docker Compose ejecuta ambos servicios en una red privada. K3s agrupa ambos contenedores en **un único Pod** con `replicas: 1` y publica solamente el NodePort **30081**. El NodePort `30080` queda reservado para `paas-web` y no se modifica.

La guía completa para ARM64, Compose, K3s y diagnóstico está en [DEPLOYMENT.md](DEPLOYMENT.md).

## Requisitos y ejecución local

Node.js **22.12 o superior** y npm. Se recomienda Node.js 24 LTS. No necesitas Docker, Suricata ni PostgreSQL para ejecutar este MVP.

Desde la raíz del repositorio, abre dos terminales:

### 1. Backend

```bash
cd edge-security-dashboard/backend
npm install
npm run dev
```

API: http://127.0.0.1:3001. `npm run dev` reinicia el servidor cuando cambias sus archivos. `npm start` lo inicia sin observar cambios.

### 2. Frontend

```bash
cd edge-security-dashboard/frontend
npm install
npm run dev
```

Abre **http://127.0.0.1:5173**. Si tu terminal ya está dentro de `edge-security-dashboard`, usa simplemente `cd backend` o `cd frontend`.

Vite reenvía `/api` al backend en `127.0.0.1:3001`. Así la configuración local no necesita CORS. Ambos procesos deben permanecer encendidos. Usa `Ctrl+C` para detenerlos.

## Ejecución con Docker Compose

Requiere Docker Engine o Docker Desktop con Compose v2:

```bash
cd edge-security-dashboard
docker compose up --build -d
docker compose ps
curl http://127.0.0.1:8080/healthz
curl http://127.0.0.1:8080/api/status
```

Abre **http://127.0.0.1:8080**. Para revisar logs o retirar únicamente este proyecto:

```bash
docker compose logs -f
docker compose down
```

El `.env` de Compose es opcional; `.env.example` permite cambiar el puerto publicado y los nombres locales de imagen sin contener secretos.

## Despliegue resumido en K3s

Los manifiestos de `k8s/` usan `edge-cloud`. Las imágenes ARM64 deben estar importadas en containerd de K3s o publicadas en un registro antes de aplicar:

```bash
sudo k3s kubectl apply -f k8s/namespace.yaml
sudo k3s kubectl apply -f k8s/configmap.yaml
sudo k3s kubectl apply -f k8s/deployment.yaml
sudo k3s kubectl apply -f k8s/service.yaml
sudo k3s kubectl rollout status deployment/edge-security-dashboard -n edge-cloud
```

Acceso LAN: **http://IP_DE_LA_RASPBERRY:30081**. Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para construir `linux/arm64`, transferir las imágenes y verificar que `paas-web` siga en `30080`.

### Configuración opcional

Los valores predeterminados funcionan sin archivos `.env`. Para personalizarlos, copia `.env.example` a `.env` en la carpeta correspondiente y reinicia el proceso:

| Carpeta  | Variable            | Predeterminado          | Uso                                   |
| -------- | ------------------- | ----------------------- | ------------------------------------- |
| backend  | `PORT`              | `3001`                  | Puerto de Express                     |
| backend  | `HOST`              | `127.0.0.1`             | Interfaz de escucha                   |
| frontend | `API_PROXY_TARGET`  | `http://127.0.0.1:3001` | Destino del proxy de Vite, sin `/api` |
| frontend | `VITE_API_BASE_URL` | `/api`                  | Prefijo que consulta el navegador     |

Para consultar después la API de la VM durante el desarrollo, cambia `API_PROXY_TARGET` a `http://IP_DE_LA_VM:3001`. La API remota debe ser accesible y escuchar en la interfaz adecuada. Si usas directamente una URL absoluta en `VITE_API_BASE_URL`, ese servidor debe permitir el origen del frontend mediante CORS. Las variables `VITE_` son públicas y nunca deben contener secretos.

## Vistas

- **Overview:** cinco tarjetas para System Status, Total Alerts, Critical Alerts, Devices Online y Services Running; distribución por severidad, alertas recientes y actividad de dispositivos.
- **Alerts:** severidad, firma, IP origen/destino, protocolo, fecha/hora y estado `new`, `reviewed` o `ignored`. Permite buscar y filtrar por severidad y estado.
- **Devices:** IP, hostname, MAC simulada, estado, última actividad y eventos asociados; búsqueda por hostname, IP o MAC.
- **Services:** Suricata, API, Database y Ubuntu Security VM, con estados `running`, `warning` o `stopped` y comprobación simulada.

El bloque persistente **Cloud Service Model** aparece en todas las vistas y resume IaaS, PaaS y SaaS para facilitar la explicación de la arquitectura durante una exposición.

La navegación usa fragmentos (`#overview`, `#alerts`, `#devices`, `#services`) y soporta recarga y botones atrás/adelante. **Actualizar** vuelve a consultar la API. No hay polling, autenticación, cambios de estado ni persistencia en este MVP. Las fechas se muestran en la zona horaria del navegador.

## API

Las respuestas exitosas usan JSON y HTTP 200. Las rutas inexistentes responden HTTP 404 con `{ "error": "Endpoint no encontrado." }`; los errores internos responden HTTP 500 sin exponer detalles al cliente.

| Método | Endpoint        | Respuesta                                                                                                                           |
| ------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/status`   | `{ status, label, message, source, checkedAt }`                                                                                     |
| GET    | `/api/summary`  | `{ source, totalDevices, onlineDevices, totalAlerts, criticalAlerts, newAlerts, runningServices, totalServices, alertsBySeverity }` |
| GET    | `/api/alerts`   | Array de `{ id, signature, category, severity, sourceIp, destinationIp, protocol, timestamp, status }`                              |
| GET    | `/api/devices`  | Array de `{ id, ip, hostname, mac, status, lastSeen, eventCount }`                                                                  |
| GET    | `/api/services` | Array de `{ id, name, status, layer, description, checkedAt, source }`                                                              |

Ejemplo: http://127.0.0.1:3001/api/alerts

```json
{
  "id": "evt-001",
  "signature": "Possible command and control callback",
  "category": "A Network Trojan was detected",
  "severity": "CRITICAL",
  "sourceIp": "192.168.1.20",
  "destinationIp": "192.168.1.10",
  "protocol": "TCP",
  "timestamp": "2026-09-14T20:30:00Z",
  "status": "new"
}
```

El ejemplo es un elemento del array devuelto por `/api/alerts`. Los filtros se aplican en el frontend sobre el conjunto pequeño del MVP; el backend devuelve los listados completos.

## Datos y reglas del MVP

Los fixtures son una captura fija del 14 de septiembre de 2026: **6 dispositivos, 8 alertas, 2 críticas y 3 de 4 servicios en estado running**. Todos los estados de infraestructura son simulados, incluido API; recibir una respuesta demuestra conectividad con Express, pero no comprueba los demás servicios. Database figura en warning porque aún no está integrada. Actualizar consulta nuevamente los fixtures y no genera telemetría nueva.

`transformEvent()` en `alertService.js` transforma eventos estilo Suricata EVE al contrato del frontend. Se ignoran eventos que no sean alertas. La política de este MVP transforma prioridades `1 → HIGH`, `2 → MEDIUM`, `3 → LOW`; `CRITICAL` se declara explícitamente en `dashboard.severity`, un campo propio de los fixtures. No se inventa un nivel numérico de Suricata para CRITICAL. Una prioridad desconocida se presenta como MEDIUM de forma conservadora. En la integración real, esta política deberá validarse y documentarse junto con las reglas del sensor.

Estado general:

1. **Crítico:** hay una alerta CRITICAL con estado `new` o un servicio `stopped`.
2. **Advertencia:** hay una alerta HIGH/MEDIUM con estado `new` o algún servicio que no está `running`.
3. **Seguro:** ninguna condición anterior. Puede haber alertas LOW o alertas ya revisadas/ignoradas.

Los totales incluyen todos los estados de alerta; el estado general solo considera alertas nuevas. Los eventos asociados de un dispositivo son las alertas donde aparece como origen o destino, contadas una vez por dispositivo. Por ello, sumar eventos de todos los dispositivos puede superar el total de alertas.

## Estructura y responsabilidades

```text
edge-security-dashboard/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── test/security.test.js
│   └── src/
│       ├── app.js                     # Express y errores HTTP
│       ├── server.js                  # Puerto e inicio
│       ├── routes/securityRoutes.js   # URLs
│       ├── controllers/securityController.js # Request/response
│       ├── services/                  # Transformación, reglas y métricas
│       └── data/                      # Eventos, dispositivos, servicios mock
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   ├── index.html
│   ├── vite.config.js                 # React y proxy /api
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                    # Layout y navegación
│       ├── components/                # Tablas, badges, iconos y tarjetas
│       ├── pages/                     # Overview, Alerts, Devices, Services
│       ├── services/                  # fetch, carga/error y fechas
│       └── styles/index.css           # Diseño responsive
├── k8s/                               # Namespace, ConfigMap, Deployment y Service
├── compose.yaml
├── .env.example                       # Opciones Compose sin secretos
├── DEPLOYMENT.md
└── README.md
```

El `AGENTS.md` de la raíz del repositorio gobierna este proyecto y se conserva sin modificaciones. Los iconos son SVG locales; la interfaz tiene fuentes de respaldo del sistema.

## Cómo probar

1. Inicia ambos procesos y abre el frontend. Overview debe mostrar **Crítico**, 6 dispositivos, 8 alertas, 2 críticas y 3/4 servicios.
2. Abre Alerts y selecciona `CRITICAL`: deben aparecer dos registros. Prueba búsqueda por IP y combina filtros. Una búsqueda sin coincidencias muestra un estado vacío; **Limpiar** restablece los resultados.
3. Abre Devices y busca `ubuntu-security`: debe mostrar 4 eventos asociados.
4. Abre Services: Database debe estar en **Warning** y todos los servicios deben indicar **Simulado**.
5. Detén el backend y pulsa **Actualizar**: aparece el error con **Reintentar**, conservando los datos previos con aviso. Recarga sin backend para comprobar el error inicial. Reinícialo y pulsa **Reintentar** para recuperar la vista. Si una solicitud queda pendiente, se cancela a los 10 segundos.
6. En las herramientas de desarrollo del navegador, pestaña Network, verifica solicitudes a los cinco endpoints. Para observar carga, activa una conexión lenta y recarga.
7. Prueba la interfaz a ancho de móvil; las tablas permiten desplazamiento horizontal.

Pruebas del backend (usa el runner integrado de Node, sin librerías adicionales):

```bash
cd edge-security-dashboard/backend
npm test
```

Verifica transformación de severidades, reglas de estado, respuestas HTTP y coherencia entre métricas y listados.

Compilar y previsualizar frontend (con Express encendido):

```bash
cd edge-security-dashboard/frontend
npm run build
npm run preview
```

Abre http://127.0.0.1:4173. Vite preview también tiene el proxy configurado. `dist/` contiene la compilación; servir esos archivos por sí solos requiere configurar `/api` en el servidor de destino. Los servidores de Vite se usan aquí para desarrollo y previsualización local.

## Integración futura con IaaS / PaaS

- **IaaS:** Ubuntu Security VM sobre KubeVirt/K3s en Raspberry Pi 5.
- **PaaS:** Docker + Suricata + API + Database dentro de la VM.
- **SaaS:** este dashboard.

### Suricata

Reemplazar la lectura de fixtures en `alertService.js` por un lector o proceso de ingestión de `eve.json`. EVE produce eventos JSON que se pueden transformar al contrato actual. Procesar únicamente `event_type: "alert"`, validar cada evento, asignar identificadores estables y contemplar rotación de archivos. Mantener `transformEvent()` como frontera entre el sensor y la API. No leer el archivo completo en cada solicitud cuando crezca.

### PostgreSQL

Crear después tablas de alertas y dispositivos. El proceso de ingestión guardará eventos normalizados; los servicios consultarán PostgreSQL mediante consultas parametrizadas. Los estados de revisión se persistirán en la base. Reemplazar los imports de fixtures y adaptar los controladores a servicios asíncronos conservando las URLs y contratos JSON. Añadir paginación y filtros del lado servidor cuando el volumen lo requiera.

### Salud de servicios

Reemplazar `serviceHealthService.js` por comprobaciones reales de Docker, `systemctl` o endpoints de salud, con timeout. Actualizar también los campos `source` y las etiquetas de entorno del frontend al abandonar modo mock. La configuración actual ya empaqueta API y frontend, sirve `dist/` con Nginx y reenvía `/api` a Express; todavía no instala Suricata ni PostgreSQL ni configura acceso a la VM.

Se dejaron los TODO solicitados junto a cada punto de integración.

## Referencias

- [Guía oficial de Vite](https://vite.dev/guide/): entorno de desarrollo y requisitos de Node.js.
- [Formato EVE JSON de Suricata](https://docs.suricata.io/en/latest/output/eve/eve-json-format.html): estructura de los eventos del sensor.
