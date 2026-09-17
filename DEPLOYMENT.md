# Despliegue de Edge Security Dashboard

Guía para Docker Compose y K3s en Raspberry Pi 5 con Debian ARM64. Ningún comando de esta guía modifica el servicio existente `paas-web`.

## Auditoría técnica

| Área | Resultado comprobado |
| --- | --- |
| Lenguaje | JavaScript con ES Modules; no hay TypeScript |
| Frontend | React `19.3.0`, React DOM `19.3.0` y Vite `8.3.0` según `package-lock.json` |
| Backend | Node.js `>=22.12.0`, Express `4.22.2` según `package-lock.json` |
| Frontend dev/build | `npm run dev` en `5173`; `npm run build` genera `frontend/dist/`; `npm run preview` usa `4173` |
| Backend dev/producción | `npm run dev` y `npm start`; Express usa `3001` |
| API | `GET /api/status`, `/api/summary`, `/api/alerts`, `/api/devices`, `/api/services` |
| Datos | Fixtures JavaScript en `backend/src/data/`; no hay JSON externo ni base de datos |
| Estado inicial de despliegue | No existían Dockerfiles, Compose ni manifiestos Kubernetes |

El backend es necesario: transforma eventos EVE simulados, asocia eventos a dispositivos y calcula métricas. Producción usa dos contenedores, agrupados en un solo Pod en K3s para mantener bajo el consumo.

## Arquitectura final

```text
PC/LAN :8080 (Compose) o Raspberry :30081 (K3s)
                         │
                         ▼
               Nginx sin privilegios :8080
                  ├── /        → React/Vite estático
                  └── /api/*   → Express :3001
                                      │
                                      └── datos mock en memoria
```

- Compose usa dos servicios y una red privada; solo Nginx publica puerto.
- K3s usa un Deployment, una réplica, un Pod con dos contenedores y un Service NodePort.
- No hay Ingress porque la demo usa LAN directa.
- No hay Secret porque la aplicación no usa credenciales.
- `paas-web` y `30080` no se referencian ni modifican.

## Variables y puertos

| Variable | Predeterminado | Ámbito |
| --- | --- | --- |
| `PORT` | `3001` | Express |
| `HOST` | `127.0.0.1` local; `0.0.0.0` en contenedor | Express |
| `API_PROXY_TARGET` | `http://127.0.0.1:3001` | Vite desarrollo |
| `VITE_API_BASE_URL` | `/api` | Compilación frontend |
| `EDGE_DASHBOARD_PORT` | `8080` | Puerto host de Compose |
| `FRONTEND_IMAGE` | `edge-security-dashboard:local` | Compose |
| `BACKEND_IMAGE` | `edge-security-api:local` | Compose |

Ninguna variable contiene secretos. `.env` queda fuera de las imágenes.

| Uso | Puerto |
| --- | --- |
| Vite desarrollo / preview | `5173` / `4173` |
| Express interno | `3001` |
| Nginx / Compose | `8080` |
| SaaS / K3s NodePort | `30081` |
| `paas-web` existente | `30080`, reservado |

## Ejecución sin Docker

Requiere Node.js 22.12 o superior y npm. Desde la raíz, abre dos terminales.

```bash
cd backend
npm ci
npm run dev
```

```bash
cd frontend
npm ci
npm run dev
```

Prueba:

```bash
curl http://127.0.0.1:3001/api/status
curl http://127.0.0.1:3001/api/summary
curl -I http://127.0.0.1:5173
```

Abre `http://127.0.0.1:5173`.

## Docker Compose

Requiere Docker Engine o Docker Desktop y Compose v2.

```bash
cp .env.example .env
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

En PowerShell usa `Copy-Item .env.example .env` para el primer comando.

Comprueba frontend y API a través del mismo origen:

```bash
curl -f http://127.0.0.1:8080/healthz
curl -I http://127.0.0.1:8080/
curl -f http://127.0.0.1:8080/api/status
curl -f http://127.0.0.1:8080/api/summary
```

Logs, salud, parada y reinicio:

```bash
docker compose logs --tail=100 frontend
docker compose logs --tail=100 backend
docker inspect --format '{{json .State.Health}}' edge-security-dashboard-frontend-1
docker inspect --format '{{json .State.Health}}' edge-security-dashboard-backend-1
docker compose stop
docker compose ps -a
docker compose start
curl -f http://127.0.0.1:8080/api/status
docker compose restart backend
curl -f --retry 10 --retry-delay 1 http://127.0.0.1:8080/api/status
```

Retira solamente este entorno:

```bash
docker compose down
```

## Compatibilidad ARM64

- `node:24-alpine3.22` es oficial y publica `linux/arm64/v8`.
- `nginxinc/nginx-unprivileged:stable-alpine-slim` es de NGINX Inc., multi-arquitectura, sin privilegios y usa `8080`. Para máxima reproducibilidad después de la demo, fija el digest validado por tu registro.
- El lockfile contiene `@rolldown/binding-linux-arm64-musl` y `@rolldown/binding-linux-arm64-gnu` `1.2.8` para compilar Vite.
- React y Express son JavaScript. La imagen frontend final solo contiene estáticos y Nginx.

Límites máximos del Pod: frontend `100m/64Mi`, backend `200m/128Mi`; total `300m CPU/192Mi`.

Riesgo: esta estación no tiene Docker, kubectl ni K3s. Aquí no fue posible construir las imágenes, ejecutar Compose, consultar manifests OCI ni validar contra un API Server. Las plataformas se verificaron en los registros de los proveedores; ejecuta las comprobaciones siguientes antes de la demo.

## Construcción para `linux/arm64`

```bash
docker buildx create --name edge-arm64-builder --use
docker buildx inspect --bootstrap
```

Si el builder ya existe: `docker buildx use edge-arm64-builder`.

```bash
docker buildx build --platform linux/arm64 -t edge-security-api:0.2.0-arm64 --load ./backend
docker buildx build --platform linux/arm64 -t edge-security-dashboard:0.2.0-arm64 --load ./frontend
docker image inspect edge-security-api:0.2.0-arm64 --format '{{.Os}}/{{.Architecture}}'
docker image inspect edge-security-dashboard:0.2.0-arm64 --format '{{.Os}}/{{.Architecture}}'
```

Los dos últimos comandos deben devolver `linux/arm64`.

### Transferir a K3s sin registro

```bash
docker save -o edge-security-images-arm64.tar edge-security-api:0.2.0-arm64 edge-security-dashboard:0.2.0-arm64
scp edge-security-images-arm64.tar USUARIO@IP_DE_LA_RASPBERRY:/tmp/
ssh USUARIO@IP_DE_LA_RASPBERRY 'mkdir -p ~/edge-security-dashboard/k8s'
scp k8s/*.yaml USUARIO@IP_DE_LA_RASPBERRY:~/edge-security-dashboard/k8s/
```

En la Raspberry:

```bash
sudo k3s ctr images import /tmp/edge-security-images-arm64.tar
sudo k3s ctr images list | grep edge-security
```

### Publicar en un registro

Usa credenciales fuera del repositorio:

```bash
docker login REGISTRO
docker buildx build --platform linux/arm64 -t REGISTRO/USUARIO/edge-security-api:0.2.0-arm64 --push ./backend
docker buildx build --platform linux/arm64 -t REGISTRO/USUARIO/edge-security-dashboard:0.2.0-arm64 --push ./frontend
docker buildx imagetools inspect REGISTRO/USUARIO/edge-security-api:0.2.0-arm64
docker buildx imagetools inspect REGISTRO/USUARIO/edge-security-dashboard:0.2.0-arm64
```

Reemplaza los dos campos `image:` de `k8s/deployment.yaml`. Un registro privado necesitará un `imagePullSecret` creado directamente en el clúster; el repositorio no incluye credenciales.

## Despliegue en K3s

En la Raspberry, desde `~/edge-security-dashboard`, comprueba primero el recurso existente:

```bash
sudo k3s kubectl get namespace edge-cloud
sudo k3s kubectl get service paas-web -n edge-cloud -o wide
sudo k3s kubectl get service -n edge-cloud
```

`paas-web` debe continuar mostrando `30080`. Aplica solo el SaaS:

```bash
sudo k3s kubectl apply -f k8s/namespace.yaml
sudo k3s kubectl apply -f k8s/configmap.yaml
sudo k3s kubectl apply -f k8s/deployment.yaml
sudo k3s kubectl apply -f k8s/service.yaml
sudo k3s kubectl rollout status deployment/edge-security-dashboard -n edge-cloud --timeout=120s
```

Diagnóstico:

```bash
sudo k3s kubectl get pods -n edge-cloud -l app.kubernetes.io/name=edge-security-dashboard -o wide
sudo k3s kubectl get service edge-security-dashboard -n edge-cloud -o wide
sudo k3s kubectl get endpoints edge-security-dashboard -n edge-cloud
sudo k3s kubectl describe deployment edge-security-dashboard -n edge-cloud
sudo k3s kubectl get events -n edge-cloud --sort-by=.metadata.creationTimestamp
sudo k3s kubectl logs deployment/edge-security-dashboard -n edge-cloud -c frontend --tail=100
sudo k3s kubectl logs deployment/edge-security-dashboard -n edge-cloud -c backend --tail=100
sudo k3s kubectl get service paas-web -n edge-cloud -o wide
```

Prueba desde la Raspberry:

```bash
curl -f http://$(hostname -I | awk '{print $1}'):30081/healthz
curl -f http://$(hostname -I | awk '{print $1}'):30081/api/status
curl -f http://$(hostname -I | awk '{print $1}'):30081/api/summary
```

Desde otra PC de la LAN:

```bash
curl -f http://IP_DE_LA_RASPBERRY:30081/healthz
curl -f http://IP_DE_LA_RASPBERRY:30081/api/status
```

Navegador: `http://IP_DE_LA_RASPBERRY:30081`.

Si falla el acceso LAN:

```bash
ip -br address
sudo ss -lntp | grep 30081
sudo k3s kubectl get pods,svc,endpoints -n edge-cloud
```

## Actualización, rollback y eliminación selectiva

```bash
sudo k3s kubectl set image deployment/edge-security-dashboard -n edge-cloud frontend=edge-security-dashboard:NUEVA_ETIQUETA backend=edge-security-api:NUEVA_ETIQUETA
sudo k3s kubectl rollout status deployment/edge-security-dashboard -n edge-cloud --timeout=120s
sudo k3s kubectl rollout undo deployment/edge-security-dashboard -n edge-cloud
```

`Recreate` evita duplicar memoria, con una interrupción breve al actualizar. Para borrar únicamente este SaaS, sin borrar el namespace:

```bash
sudo k3s kubectl delete deployment/edge-security-dashboard service/edge-security-dashboard configmap/edge-security-dashboard-config -n edge-cloud
sudo k3s kubectl get service paas-web -n edge-cloud -o wide
```

No se incluyen comandos de limpieza global de imágenes, namespaces, volúmenes o recursos del clúster.

## Limitaciones e integraciones futuras

- Datos y estados simulados; no persisten al reiniciar.
- Sin autenticación, PostgreSQL ni escritura desde el dashboard.
- Suricata, Database y VM aún no ejecutan comprobaciones reales.
- NodePort ofrece HTTP en LAN; TLS requerirá un Ingress o proxy explícito.

Evolución prevista: ingerir Suricata `eve.json`, persistir en PostgreSQL con consultas parametrizadas y sustituir `serviceHealthService.js` por health checks reales con timeout, conservando `/api/*`.

## Referencias

- [Node.js oficial en Docker Hub](https://hub.docker.com/_/node/tags?name=24-alpine)
- [Nginx Unprivileged de NGINX Inc.](https://hub.docker.com/r/nginxinc/nginx-unprivileged)
- [Service NodePort de Kubernetes](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Security Context de Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
