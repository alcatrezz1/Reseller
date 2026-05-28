from fastapi import FastAPI, HTTPException, Header, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
import uuid
import os

app = FastAPI(title="re:Seller API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://reseller:ТВОЙ_ПАРОЛЬ@localhost/reseller_db")
ADMIN_KEY    = os.getenv("ADMIN_KEY", "reseller2025")

UPLOAD_DIR = Path("/var/www/reseller/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

engine        = create_engine(DATABASE_URL)
SessionLocal  = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base          = declarative_base()

# ── Models ──

class Product(Base):
    __tablename__ = "products"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(200))
    price       = Column(Float)
    brand       = Column(String(100))
    series      = Column(String(100), nullable=True)
    image       = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    storage     = Column(String(100), nullable=True)
    color       = Column(String(200), nullable=True)
    sim         = Column(String(100), nullable=True)
    is_featured = Column(Boolean, default=False)
    is_new      = Column(Boolean, default=False)

class Banner(Base):
    __tablename__ = "banners"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200))
    subtitle    = Column(String(500), nullable=True)
    image_url   = Column(Text, nullable=True)
    button_text = Column(String(100), nullable=True)
    button_url  = Column(String(500), nullable=True)
    order       = Column(Integer, default=0)
    active      = Column(Boolean, default=True)

Base.metadata.create_all(engine)

# ── DB dependency ──

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Admin auth ──

def check_admin(x_admin_key: str = Header(None)):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

# ── Schemas ──

class ProductIn(BaseModel):
    name:        str
    price:       float
    brand:       str
    series:      Optional[str] = None
    image:       Optional[str] = None
    description: Optional[str] = None
    storage:     Optional[str] = None
    color:       Optional[str] = None
    sim:         Optional[str] = None
    is_featured: Optional[bool] = False
    is_new:      Optional[bool] = False

class BannerIn(BaseModel):
    title:       str
    subtitle:    Optional[str] = None
    image_url:   Optional[str] = None
    button_text: Optional[str] = None
    button_url:  Optional[str] = None
    order:       Optional[int] = 0
    active:      Optional[bool] = True

# ════════════════════════════════
# ── Products ──
# ════════════════════════════════

@app.get("/api/products")
def get_products(
    brand: Optional[str] = None,
    series: Optional[str] = None,
    featured: Optional[bool] = None,
    is_new: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Product)
    if brand:    q = q.filter(Product.brand == brand)
    if series:   q = q.filter(Product.series == series)
    if featured: q = q.filter(Product.is_featured == True)
    if is_new:   q = q.filter(Product.is_new == True)
    return q.all()

@app.get("/api/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p

@app.post("/api/products", dependencies=[Depends(check_admin)])
def add_product(p: ProductIn, db: Session = Depends(get_db)):
    product = Product(**p.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.put("/api/products/{product_id}", dependencies=[Depends(check_admin)])
def update_product(product_id: int, p: ProductIn, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in p.dict().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@app.delete("/api/products/{product_id}", dependencies=[Depends(check_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(product)
    db.commit()
    return {"ok": True}

# ════════════════════════════════
# ── Banners ──
# ════════════════════════════════

@app.get("/api/banners")
def get_banners(db: Session = Depends(get_db)):
    return db.query(Banner).filter(Banner.active == True).order_by(Banner.order).all()

@app.get("/api/banners/all", dependencies=[Depends(check_admin)])
def get_all_banners(db: Session = Depends(get_db)):
    return db.query(Banner).order_by(Banner.order).all()

@app.post("/api/banners", dependencies=[Depends(check_admin)])
def add_banner(b: BannerIn, db: Session = Depends(get_db)):
    banner = Banner(**b.dict())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner

@app.put("/api/banners/{banner_id}", dependencies=[Depends(check_admin)])
def update_banner(banner_id: int, b: BannerIn, db: Session = Depends(get_db)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in b.dict().items():
        setattr(banner, key, value)
    db.commit()
    db.refresh(banner)
    return banner

@app.delete("/api/banners/{banner_id}", dependencies=[Depends(check_admin)])
def delete_banner(banner_id: int, db: Session = Depends(get_db)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(banner)
    db.commit()
    return {"ok": True}

# ════════════════════════════════
# ── Upload ──
# ════════════════════════════════

@app.get("/admin")
def admin_page():
    return FileResponse("/var/www/reseller/admin.html")

@app.post("/api/upload", dependencies=[Depends(check_admin)])
async def upload_image(file: UploadFile = File(...)):
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Invalid file type")
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        f.write(await file.read())
    return {"url": f"http://186.246.9.150:8000/uploads/{filename}"}
