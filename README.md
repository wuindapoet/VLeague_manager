# V-League 2026 Manager

Repo gồm:
- `client/`: Frontend (React + Vite)
- `server/`: Backend
- `docker-compose.yml`: MongoDB + server + client (hiện Dockerfile đang chưa có nội dung)

## Yêu cầu môi trường

- Node.js
- npm (đi kèm Node)

## Chạy Frontend (client)
### 1) Cài dependencies

```bash
git clone https://github.com/wuindapoet/VLeague_manager.git
cd VLeague_manager

# cài cho frontend
cd client
npm install
```

### 2) Chạy dev server

```bash
npm run dev
```

Mặc định Vite sẽ chạy tại 1 cổng (hiện ở bash / log)
