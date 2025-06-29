#!/bin/bash
# migration_scripts.sh - Complete migration scripts

set -e  # Exit on any error

# Configuration
LOCAL_DB_HOST="localhost"
LOCAL_DB_USER="postgres"
LOCAL_DB_NAME="smart_supply_chain"
RDS_ENDPOINT="supply-chain-mgmt-postgres.czjz4qycxdxq.us-east-1.rds.amazonaws.com"
RDS_USER="dbadmin"
RDS_DB_NAME="supplychain"
BACKUP_FILE="supply_chain_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "🚀 Starting PostgreSQL to RDS Migration..."

# Step 1: Create backup of local database
echo "📦 Creating backup of local database..."
pg_dump -h $LOCAL_DB_HOST \
        -U $LOCAL_DB_USER \
        -d $LOCAL_DB_NAME \
        --clean \
        --create \
        --if-exists \
        --no-owner \
        --no-privileges \
        -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Step 2: Test RDS connection
echo "🔗 Testing RDS connection..."
psql -h $RDS_ENDPOINT \
     -U $RDS_USER \
     -d postgres \
     -c "SELECT version();" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ RDS connection successful"
else
    echo "❌ RDS connection failed!"
    exit 1
fi

# Step 3: Create database if not exists
echo "🗄️ Creating database if not exists..."
psql -h $RDS_ENDPOINT \
     -U $RDS_USER \
     -d postgres \
     -c "CREATE DATABASE $RDS_DB_NAME;" 2>/dev/null || echo "Database may already exist"

# Step 4: Import data to RDS
echo "📥 Importing data to RDS..."
psql -h $RDS_ENDPOINT \
     -U $RDS_USER \
     -d $RDS_DB_NAME \
     -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Data import successful"
else
    echo "❌ Data import failed!"
    exit 1
fi

# Step 5: Verify data migration
echo "🔍 Verifying data migration..."

# Count tables
LOCAL_TABLES=$(psql -h $LOCAL_DB_HOST -U $LOCAL_DB_USER -d $LOCAL_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
RDS_TABLES=$(psql -h $RDS_ENDPOINT -U $RDS_USER -d $RDS_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

echo "Local tables: $LOCAL_TABLES"
echo "RDS tables: $RDS_TABLES"

if [ "$LOCAL_TABLES" -eq "$RDS_TABLES" ]; then
    echo "✅ Table count matches"
else
    echo "⚠️ Table count mismatch - please verify manually"
fi

# Step 6: Test sample queries
echo "🧪 Testing sample queries..."

# Test inventory table (adjust table name as needed)
RDS_INVENTORY_COUNT=$(psql -h $RDS_ENDPOINT -U $RDS_USER -d $RDS_DB_NAME -t -c "SELECT COUNT(*) FROM inventory;" 2>/dev/null || echo "0")
echo "Inventory records in RDS: $RDS_INVENTORY_COUNT"

# Step 7: Create connection test script
cat > test_rds_connection.js << 'EOF'
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to RDS successfully');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current time from RDS:', result.rows[0].current_time);
    
    // Test inventory table
    const inventoryResult = await client.query('SELECT COUNT(*) as count FROM inventory');
    console.log('Inventory count:', inventoryResult.rows[0].count);
    
  } catch (err) {
    console.error('❌ Connection error:', err);
  } finally {
    await client.end();
  }
}

testConnection();
EOF

echo "📝 Created test_rds_connection.js"
echo "Run: node test_rds_connection.js (after setting environment variables)"

# Step 8: Create environment file template
cat > .env.rds << EOF
# RDS Configuration
DB_HOST=$RDS_ENDPOINT
DB_PORT=5432
DB_NAME=$RDS_DB_NAME
DB_USER=$RDS_USER
DB_PASSWORD=YourSecurePassword123!
DB_SSL=true

# Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_ACQUIRE_TIMEOUT=60000

# Application settings
NODE_ENV=production
API_PORT=8000
EOF

echo "📝 Created .env.rds template"

echo "🎉 Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your application configuration with RDS endpoint"
echo "2. Test the connection using: node test_rds_connection.js"
echo "3. Update your CI/CD pipeline with new database settings"
echo "4. Consider setting up read replicas for better performance"
echo "5. Configure automated backups and monitoring"
echo ""
echo "💰 Cost optimization tips:"
echo "- Use db.t3.micro for development (free tier eligible)"
echo "- Enable storage autoscaling"
echo "- Set up CloudWatch alarms for monitoring"
echo "- Consider Reserved Instances for production"

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    # Uncomment if you want to auto-delete backup file
    # rm -f $BACKUP_FILE
}

# Register cleanup function to be called on script exit
trap cleanup EXIT