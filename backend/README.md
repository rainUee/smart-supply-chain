# Smart Supply Chain Backend

基于 FastAPI 的智能供应链管理系统后端 API。

## 技术栈

- **FastAPI** - 高性能 Python Web 框架
- **SQLAlchemy** - ORM 数据库操作
- **PostgreSQL** - 主数据库
- **Alembic** - 数据库迁移
- **Pydantic** - 数据验证
- **JWT** - 身份认证
- **Boto3** - AWS 集成

## 快速开始

### 1. 环境要求

- Python 3.8+
- PostgreSQL 12+
- pip

### 2. 安装依赖

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 3. 环境配置

复制环境变量模板并配置：

```bash
cp env.production.template .env
```

编辑 `.env` 文件，配置以下必要参数：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/smart_supply_chain
DATABASE_URL_ASYNC=postgresql+asyncpg://username:password@localhost:5432/smart_supply_chain

# 安全配置
SECRET_KEY=your-secret-key-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# 应用配置
DEBUG=True
ENVIRONMENT=development
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### 4. 数据库设置

```bash
# 创建 PostgreSQL 数据库
createdb smart_supply_chain

# 初始化数据库（创建表和种子数据）
python init_db.py
```

### 5. 运行应用

```bash
# 开发模式运行
python run.py

# 或者使用 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

应用将在 `http://localhost:8000` 启动

## API 文档

启动应用后，可以访问以下文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 默认账户

初始化后会自动创建管理员账户：

- **邮箱**: admin@example.com
- **密码**: admin123

## API 端点

### 认证相关
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/refresh` - 刷新令牌

### 用户管理
- `GET /api/v1/users/me` - 获取当前用户信息
- `PUT /api/v1/users/me` - 更新当前用户信息
- `GET /api/v1/users/` - 获取用户列表（管理员）
- `GET /api/v1/users/{user_id}` - 获取指定用户信息
- `PUT /api/v1/users/{user_id}` - 更新指定用户（管理员）

### 供应商管理
- `GET /api/v1/suppliers/` - 获取供应商列表
- `POST /api/v1/suppliers/` - 创建供应商
- `GET /api/v1/suppliers/{supplier_id}` - 获取供应商详情
- `PUT /api/v1/suppliers/{supplier_id}` - 更新供应商
- `DELETE /api/v1/suppliers/{supplier_id}` - 删除供应商

### 产品管理
- `GET /api/v1/products/` - 获取产品列表
- `POST /api/v1/products/` - 创建产品
- `GET /api/v1/products/{product_id}` - 获取产品详情
- `PUT /api/v1/products/{product_id}` - 更新产品
- `DELETE /api/v1/products/{product_id}` - 删除产品
- `GET /api/v1/products/categories/list` - 获取产品分类列表

## 数据库迁移

```bash
# 创建新的迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 项目结构

```
backend/
├── app/
│   ├── api/                 # API 路由
│   │   └── v1/             # API 版本 1
│   ├── core/               # 核心配置
│   ├── db/                 # 数据库配置
│   ├── models/             # 数据模型
│   ├── schemas/            # Pydantic 模式
│   └── main.py             # 主应用文件
├── alembic/                # 数据库迁移
├── tests/                  # 测试文件
├── requirements.txt        # 依赖列表
├── env.example             # 环境变量模板
├── alembic.ini            # Alembic 配置
├── run.py                 # 启动脚本
└── init_db.py             # 数据库初始化
```

## 开发指南

### 添加新的 API 端点

1. 在 `app/api/v1/` 下创建新的路由文件
2. 在 `app/api/v1/__init__.py` 中导入路由
3. 在 `app/main.py` 中注册路由

### 添加新的数据模型

1. 在 `app/models/` 下创建模型文件
2. 在 `app/models/__init__.py` 中导入模型
3. 创建对应的 Pydantic schema
4. 运行数据库迁移

### 测试

```bash
# 运行测试
pytest

# 运行测试并生成覆盖率报告
pytest --cov=app tests/
```

## 部署

### 生产环境配置

1. 设置 `ENVIRONMENT=production`
2. 设置 `DEBUG=False`
3. 配置生产数据库
4. 设置强密码的 `SECRET_KEY`
5. 配置 CORS 允许的域名

### 使用 Gunicorn 部署

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 服务是否运行
   - 验证数据库连接字符串
   - 确认数据库用户权限

2. **导入错误**
   - 确保虚拟环境已激活
   - 检查 Python 路径设置
   - 验证依赖是否正确安装

3. **迁移失败**
   - 检查数据库连接
   - 确认模型定义正确
   - 查看 Alembic 日志

## 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 