# Fullstack Dashboard

Dashboard fullstack para visualizacao de dados do IPCA no Brasil, com:
- backend em Flask para servir os dados processados;
- frontend em React + D3 para os graficos interativos;
- ambiente conteinerizado com Docker Compose.

## Visao Geral

O projeto organiza um pipeline simples de dados do IPCA e expoe uma API (`/api/ipca`) consumida pelo frontend.

## Stack

- Frontend: React, D3, Nginx (em producao no container)
- Backend: Python 3.11, Flask, Pandas
- Orquestracao: Docker Compose

## Estrutura

```text
.
├── backend
│   ├── app
│   ├── data
│   └── dockerfile
├── frontend
│   ├── src
│   └── dockerfile
└── docker-compose.yml
```

## Como Rodar (Docker)

Na raiz do projeto:

```bash
docker compose up --build
```

Servicos e portas:
- Frontend: http://localhost:8080
- Backend (API): http://localhost:5000

Endpoint principal:
- `GET /api/ipca` -> `http://localhost:5000/api/ipca`

## Comandos Uteis

Subir em background:

```bash
docker compose up --build -d
```

Ver logs:

```bash
docker compose logs -f
```

Parar e remover containers:

```bash
docker compose down
```

Rebuild forcando imagens:

```bash
docker compose build --no-cache
docker compose up
```

## Rodar Sem Docker (Opcional)

### Backend

```bash
cd backend
pip install flask pandas
python app/app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend local sem container roda por padrao em:
- http://localhost:3000

## Observacoes

- O frontend em Docker e servido por Nginx na porta `8080`.
- O backend le o arquivo processado em `backend/data/processed/ipca_grupos_regioes_long.csv`.
