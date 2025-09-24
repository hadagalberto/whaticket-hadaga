cd backend

echo "Pulling latest changes from repository..."
git pull origin master

echo "Installing backend dependencies..."
npm install

echo "Building backend and running database migrations..."
npm run build
npx sequelize db:migrate

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Restarting PM2 processes..."
pm2 restart 0
pm2 restart 1