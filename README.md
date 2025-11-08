TUTORIAL RUN CODE
1. Buka visual studio code, masukan file client dan server
2. Edit di kedua folder client dan server -> package.json line 7 delete clear
3. Tambahkan file .env di kedua folder client dan server masukan : 

VITE_SERVER_URL=http://localhost:8000
server : 
PORT=8000

DATABASE_URL="postgresql://postgres:(PASSWORD)@localhost:5432/software_engineering"
DIRECT_URL="postgresql://postgres:(PASSWORD)@localhost:5432/software_engineering"


JWT_SECRET=6896fe7b4da8c1d9673ae4b117f45dfb167e390616e391640f8679a9e9383d8e9a523b5ae706023ef95eb4dfeecbe4e6d6a11bbf3e94e1874370ff59333fd8222936b3cc0730411f99ae6503fa5f6a1cbc10095b84d7c150fa7902523031eae0eed9cd3c169d9a5cb29ba4d00dccad81e91259d50f34ab73524c07997f9305a5fc55bd466058a7cf59ab4e9165d6de9986c3493ae84f56f81953f9118c64e7a1f7e57235d3def73c7edbc89e4a1ecb916c39f367a1879a1f2f7a2be1d42ce93331f3cbbea9ec7ae5edf99723bedef938de3bf741bf2ddb60024effc07820e8c590c8a225964cb3e29edbaf90e8205c370c7523088157eedb771a69ffc8035b4b

ADMIN_PASSWORD=admin12345

WASABI_KEY=XD1QISOLE7CCYD11QT2G
WASABI_SECRET=Atw1m6a1VehbIY2ZAPomnz0irVBPhBIQtXPJPSsK
WASABI_BUCKET=evision
WASABI_REGION=ap-southeast-1
WASABI_ENDPOINT=https://s3.ap-southeast-1.wasabisys.com

6. open terminal
7. split terminal
8. ketik 
terminal 1 (client) :
cd client
npm i
npm run dev

terminal 2 (server) :
cd server
npx prisma db push --schema= schema.prisma
npm i
npm start

9. klik link yang muncul dan ada localhostnya, contohnya : http://localhost:5173/login
