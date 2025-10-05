import sqlite3

conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()

# Eliminar tabla existente si existe para recrearla con nueva estructura
c.execute('DROP TABLE IF EXISTS productos')

c.execute('''
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    image TEXT NOT NULL,
    brand TEXT NOT NULL,
    weight TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    allergens TEXT,
    nutritional_info TEXT,
    stock INTEGER NOT NULL DEFAULT 0
)
''')

# Datos de ejemplo con la nueva estructura
productos = [
    (
        "bimbo",
        "Mantecadas Vainilla",
        "Deliciosas mantecadas sabor vainilla, suaves y esponjosas.",
        3500,
        "mantecadas_vainilla_625g.jpg",
        "Bimbo",
        "625g",
        "Harina de trigo, azúcar, huevo, aceite vegetal, saborizante de vainilla.",
        "Gluten, huevo",
        "Energía: 350kcal por porción. Grasas: 15g. Azúcares: 20g.",
        20
    ),
    (
        "grupo_maseca",
        "Harina de Maíz",
        "Harina de maíz 100% natural, ideal para tortillas y tamales.",
        2800,
        "harina_maiz_1kg.jpg",
        "Maseca",
        "1kg",
        "Maíz nixtamalizado.",
        "Ninguno",
        "Energía: 365kcal por 100g. Carbohidratos: 77g. Proteínas: 8g.",
        35
    ),
    (
        "barcel",
        "Papas Sabritas Clásicas",
        "Papas fritas con sal, crujientes y doradas.",
        1800,
        "sabritas_clasicas_45g.jpg",
        "Sabritas",
        "45g",
        "Papa, aceite vegetal, sal.",
        "Ninguno",
        "Energía: 270kcal por porción. Grasas: 17g. Sodio: 200mg.",
        50
    ),
    (
        "coca_cola",
        "Coca-Cola Original",
        "Bebida refrescante con el sabor original de Coca-Cola.",
        2200,
        "coca_cola_600ml.jpg",
        "Coca-Cola",
        "600ml",
        "Agua carbonatada, azúcar, concentrado de cola, ácido fosfórico, colorante caramelo.",
        "Ninguno",
        "Energía: 250kcal por botella. Azúcares: 65g.",
        40
    ),
    (
        "lala",
        "Leche Entera",
        "Leche entera pasteurizada, rica en calcio y proteínas.",
        2600,
        "leche_lala_1l.jpg",
        "Lala",
        "1L",
        "Leche entera de vaca pasteurizada.",
        "Lactosa",
        "Energía: 150kcal por vaso. Proteínas: 8g. Calcio: 300mg.",
        25
    ),
    (
        "bimbo",
        "Pan Blanco Grande",
        "Pan de caja blanco, suave y fresco, ideal para toda la familia.",
        4200,
        "pan_blanco_680g.jpg",
        "Bimbo",
        "680g",
        "Harina de trigo, agua, azúcar, levadura, sal, conservadores.",
        "Gluten",
        "Energía: 250kcal por 2 rebanadas. Carbohidratos: 50g.",
        15
    )
]

c.executemany('''INSERT INTO productos (supplier, name, description, price_cents, image, brand, weight, ingredients, allergens, nutritional_info, stock) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', productos)

conn.commit()
conn.close()
print("Base de datos y tabla 'productos' creada con la nueva estructura y datos de ejemplo.")