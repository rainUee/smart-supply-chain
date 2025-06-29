import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import async_engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.supplier import Supplier
from app.models.product import Product


async def init_db():
    """Initialize database with tables and seed data"""
    # Create tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Database tables created successfully!")
    
    # Create seed data
    async with AsyncSession(async_engine) as session:
        # Check if admin user exists
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == "admin@example.com"))
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            # Create admin user
            admin_user = User(
                email="admin@example.com",
                name="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                is_superuser=True,
                role="admin"
            )
            session.add(admin_user)
            await session.commit()
            print("Admin user created: admin@example.com / admin123")
        
        # Create sample supplier
        result = await session.execute(select(Supplier).where(Supplier.name == "Sample Supplier"))
        supplier = result.scalar_one_or_none()
        
        if not supplier:
            supplier = Supplier(
                name="Sample Supplier",
                contact_person="John Doe",
                email="john@supplier.com",
                phone="+1234567890",
                address="123 Supplier St",
                city="Supplier City",
                country="USA",
                rating=4.5,
                is_preferred=True
            )
            session.add(supplier)
            await session.commit()
            print("Sample supplier created")
        
        # Create sample product
        result = await session.execute(select(Product).where(Product.sku == "SAMPLE-001"))
        product = result.scalar_one_or_none()
        
        if not product:
            product = Product(
                name="Sample Product",
                sku="SAMPLE-001",
                description="A sample product for testing",
                category="Electronics",
                cost_price=50.0,
                selling_price=75.0,
                current_stock=100,
                min_stock_level=10,
                reorder_point=20,
                supplier_id=supplier.id
            )
            session.add(product)
            await session.commit()
            print("Sample product created")


if __name__ == "__main__":
    asyncio.run(init_db()) 