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

# Datos completos con todos los productos organizados por proveedor
productos = [
    # BIMBO
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
        "bimbo",
        "Pan Blanco Grande",
        "Pan blanco suave, ideal para sándwiches y tostadas.",
        2800,
        "pan_blanco_680g.jpg",
        "Bimbo",
        "680g",
        "Harina de trigo, agua, levadura, sal, azúcar.",
        "Gluten",
        "Energía: 250kcal por porción. Fibra: 2g.",
        30
    ),
    (
        "bimbo",
        "Donas Azucaradas",
        "Donas cubiertas de azúcar, perfectas para acompañar tu café.",
        3200,
        "donas_azucaradas_6p.jpg",
        "Bimbo",
        "6 piezas",
        "Harina de trigo, azúcar, huevo, aceite vegetal.",
        "Gluten, huevo",
        "Energía: 400kcal por porción. Azúcares: 22g.",
        15
    ),
    (
        "bimbo",
        "Roles Canela",
        "Roles de canela con glaseado dulce.",
        4000,
        "roles_canela_4p.jpg",
        "Bimbo",
        "4 piezas",
        "Harina de trigo, azúcar, canela, huevo, aceite vegetal.",
        "Gluten, huevo",
        "Energía: 420kcal por porción. Azúcares: 24g.",
        10
    ),
    (
        "bimbo",
        "Pan Integral",
        "Pan integral saludable, fuente de fibra.",
        3000,
        "pan_integral_680g.jpg",
        "Bimbo",
        "680g",
        "Harina integral de trigo, agua, levadura, sal.",
        "Gluten",
        "Energía: 220kcal por porción. Fibra: 5g.",
        25
    ),
    (
        "bimbo",
        "Panqué Marmoleado",
        "Panqué marmoleado sabor vainilla y chocolate, suave y delicioso.",
        3400,
        "panque_marmoleado_255g.jpg",
        "Bimbo",
        "255g",
        "Harina de trigo, azúcar, huevo, aceite vegetal, cocoa.",
        "Gluten, huevo",
        "Energía: 370kcal por porción. Azúcares: 18g.",
        18
    ),
    (
        "bimbo",
        "Medias Noches",
        "Pan suave tipo hot dog, ideal para preparar medias noches.",
        3300,
        "medias_noches_320g.jpg",
        "Bimbo",
        "320g",
        "Harina de trigo, azúcar, huevo, aceite vegetal.",
        "Gluten, huevo",
        "Energía: 260kcal por porción. Azúcares: 7g.",
        22
    ),
    
    # GAMESA
    (
        "gamesa",
        "Galletas Marías",
        "Galletas clásicas Marías, perfectas para acompañar leche o café.",
        1500,
        "galletas_marias_170g.jpg",
        "Gamesa",
        "170g",
        "Harina de trigo, azúcar, huevo, aceite vegetal.",
        "Gluten, huevo",
        "Energía: 120kcal por porción. Azúcares: 8g.",
        40
    ),
    (
        "gamesa",
        "Galletas Emperador Chocolate",
        "Galletas rellenas de chocolate, crujientes y deliciosas.",
        2200,
        "galletas_emperador_100g.jpg",
        "Gamesa",
        "100g",
        "Harina de trigo, azúcar, cacao, aceite vegetal.",
        "Gluten",
        "Energía: 150kcal por porción. Azúcares: 10g.",
        35
    ),
    (
        "gamesa",
        "Galletas Arcoiris",
        "Galletas con chispas de colores, divertidas y sabrosas.",
        2000,
        "galletas_arcoiris_120g.jpg",
        "Gamesa",
        "120g",
        "Harina de trigo, azúcar, colorantes, aceite vegetal.",
        "Gluten",
        "Energía: 130kcal por porción. Azúcares: 9g.",
        20
    ),
    (
        "gamesa",
        "Galletas Saladitas",
        "Galletas saladas crujientes, ideales para botanas.",
        1800,
        "galletas_saladitas_150g.jpg",
        "Gamesa",
        "150g",
        "Harina de trigo, sal, aceite vegetal.",
        "Gluten",
        "Energía: 110kcal por porción. Sodio: 200mg.",
        25
    ),
    (
        "gamesa",
        "Galletas Chokis",
        "Galletas con chispas de chocolate, favoritas de todos.",
        2500,
        "galletas_chokis_90g.jpg",
        "Gamesa",
        "90g",
        "Harina de trigo, azúcar, chispas de chocolate.",
        "Gluten",
        "Energía: 160kcal por porción. Azúcares: 12g.",
        30
    ),
    (
        "gamesa",
        "Galletas Florentinas",
        "Galletas con relleno sabor fresa y cobertura de chocolate.",
        2400,
        "galletas_florentinas_90g.jpg",
        "Gamesa",
        "90g",
        "Harina de trigo, azúcar, fresa, chocolate, aceite vegetal.",
        "Gluten, leche",
        "Energía: 180kcal por porción. Azúcares: 12g.",
        16
    ),
    (
        "gamesa",
        "Galletas Crackets",
        "Galletas saladas tipo cracker, perfectas para botanas.",
        1700,
        "galletas_crackets_170g.jpg",
        "Gamesa",
        "170g",
        "Harina de trigo, aceite vegetal, sal.",
        "Gluten",
        "Energía: 120kcal por porción. Sodio: 180mg.",
        20
    ),
    
    # SABRITAS
    (
        "sabritas",
        "Papas Clásicas",
        "Papas fritas clásicas, crujientes y saladas.",
        1800,
        "papas_clasicas_45g.jpg",
        "Sabritas",
        "45g",
        "Papa, aceite vegetal, sal.",
        "",
        "Energía: 150kcal por porción. Grasas: 10g.",
        50
    ),
    (
        "sabritas",
        "Cheetos",
        "Botana de maíz con queso, sabor intenso.",
        1700,
        "cheetos_40g.jpg",
        "Sabritas",
        "40g",
        "Maíz, queso, aceite vegetal.",
        "Lácteos",
        "Energía: 140kcal por porción. Grasas: 8g.",
        45
    ),
    (
        "sabritas",
        "Doritos Nacho",
        "Totopos de maíz sabor nacho, perfectos para compartir.",
        1900,
        "doritos_nacho_52g.jpg",
        "Sabritas",
        "52g",
        "Maíz, queso, especias, aceite vegetal.",
        "Lácteos",
        "Energía: 160kcal por porción. Grasas: 9g.",
        40
    ),
    (
        "sabritas",
        "Ruffles Queso",
        "Papas onduladas sabor queso, extra crujientes.",
        2100,
        "ruffles_queso_45g.jpg",
        "Sabritas",
        "45g",
        "Papa, queso, aceite vegetal.",
        "Lácteos",
        "Energía: 170kcal por porción. Grasas: 11g.",
        35
    ),
    (
        "sabritas",
        "Papas Adobadas",
        "Papas fritas sabor adobadas, con especias mexicanas.",
        2000,
        "papas_adobadas_45g.jpg",
        "Sabritas",
        "45g",
        "Papa, especias, aceite vegetal.",
        "",
        "Energía: 155kcal por porción. Grasas: 10g.",
        30
    ),
    (
        "sabritas",
        "Cacahuates Japoneses",
        "Cacahuates cubiertos con una crujiente capa de harina de trigo.",
        2000,
        "cacahuates_japoneses_60g.jpg",
        "Sabritas",
        "60g",
        "Cacahuate, harina de trigo, azúcar, salsa de soya.",
        "Cacahuate, gluten, soya",
        "Energía: 320kcal por 60g.",
        24
    ),
    (
        "sabritas",
        "Rancheritos",
        "Botana de maíz sabor a chile y especias, muy crujiente.",
        1600,
        "rancheritos_62g.jpg",
        "Sabritas",
        "62g",
        "Harina de maíz, aceite vegetal, chile, especias.",
        "Puede contener soya.",
        "Energía: 290kcal por 62g.",
        26
    ),
    
    # LA COSTEÑA
    (
        "la_costena",
        "Chiles Jalapeños en Escabeche",
        "Chiles jalapeños en rodajas, ideales para acompañar tus platillos.",
        2200,
        "jalapenos_escabeche_220g.jpg",
        "La Costeña",
        "220g",
        "Chiles jalapeños, zanahoria, vinagre, especias.",
        "",
        "Energía: 25kcal por 30g.",
        30
    ),
    (
        "la_costena",
        "Frijoles Negros Refritos",
        "Frijoles negros refritos listos para servir.",
        1800,
        "frijoles_negros_refritos_430g.jpg",
        "La Costeña",
        "430g",
        "Frijol negro, aceite vegetal, sal.",
        "",
        "Energía: 90kcal por 100g.",
        25
    ),
    (
        "la_costena",
        "Elote Dorado en Grano",
        "Elote dorado en grano, ideal para ensaladas y guisos.",
        2100,
        "elote_dorado_220g.jpg",
        "La Costeña",
        "220g",
        "Elote, agua, sal.",
        "",
        "Energía: 70kcal por 100g.",
        20
    ),
    (
        "la_costena",
        "Salsa Verde",
        "Salsa verde lista para servir, perfecta para tacos y antojitos.",
        1700,
        "salsa_verde_210g.jpg",
        "La Costeña",
        "210g",
        "Tomatillo, chile, cebolla, ajo, sal.",
        "",
        "Energía: 20kcal por 30g.",
        35
    ),
    (
        "la_costena",
        "Salsa Catsup",
        "Catsup clásica, ideal para acompañar botanas y comidas rápidas.",
        1900,
        "catsup_370g.jpg",
        "La Costeña",
        "370g",
        "Tomate, azúcar, vinagre, sal, especias.",
        "",
        "Energía: 90kcal por 30g.",
        28
    ),
    (
        "la_costena",
        "Chiles Chipotles Adobados",
        "Chiles chipotles adobados en salsa, sabor ahumado y picante.",
        2300,
        "chipotles_adobados_220g.jpg",
        "La Costeña",
        "220g",
        "Chile chipotle, tomate, vinagre, especias.",
        "",
        "Energía: 40kcal por 30g.",
        22
    ),
    (
        "la_costena",
        "Nopales en Trozos",
        "Nopales en trozos cocidos, listos para ensaladas y guisos.",
        2000,
        "nopales_trozos_220g.jpg",
        "La Costeña",
        "220g",
        "Nopal, agua, sal.",
        "",
        "Energía: 15kcal por 100g.",
        18
    ),
    
    # BARCEL
    (
        "barcel",
        "Takis Fuego",
        "Botana de maíz enrollada sabor chile y limón, extra picante.",
        1500,
        "takis_fuego_62g.jpg",
        "Barcel",
        "62g",
        "Harina de maíz, aceite vegetal, condimentos, chile, limón.",
        "Puede contener soya y gluten.",
        "Energía: 280kcal por 62g.",
        40
    ),
    (
        "barcel",
        "Chips Jalapeño",
        "Papas fritas sabor jalapeño, crujientes y picantes.",
        1700,
        "chips_jalapeno_50g.jpg",
        "Barcel",
        "50g",
        "Papa, aceite vegetal, condimentos, jalapeño.",
        "Puede contener soya.",
        "Energía: 250kcal por 50g.",
        35
    ),
    (
        "barcel",
        "Runners",
        "Botana de maíz sabor queso y chile.",
        1400,
        "runners_queso_50g.jpg",
        "Barcel",
        "50g",
        "Harina de maíz, aceite vegetal, queso, chile.",
        "Contiene leche y puede contener soya.",
        "Energía: 240kcal por 50g.",
        30
    ),
    (
        "barcel",
        "Hot Nuts",
        "Cacahuates enchilados, crujientes y picantes.",
        1800,
        "hot_nuts_60g.jpg",
        "Barcel",
        "60g",
        "Cacahuate, harina de trigo, chile, sal.",
        "Contiene cacahuate y trigo.",
        "Energía: 320kcal por 60g.",
        28
    ),
    (
        "barcel",
        "Churritos Maíz",
        "Churritos de maíz sabor chile y limón.",
        1300,
        "churritos_maiz_50g.jpg",
        "Barcel",
        "50g",
        "Harina de maíz, aceite vegetal, chile, limón.",
        "Puede contener soya.",
        "Energía: 230kcal por 50g.",
        32
    ),
    (
        "barcel",
        "Takis Xtra Hot",
        "Botana de maíz enrollada sabor chile extra picante.",
        1550,
        "takis_xtrahot_62g.jpg",
        "Barcel",
        "62g",
        "Harina de maíz, aceite vegetal, condimentos, chile.",
        "Puede contener soya y gluten.",
        "Energía: 285kcal por 62g.",
        26
    )
]

# Insertar todos los productos
c.executemany('''INSERT INTO productos (supplier, name, description, price_cents, image, brand, weight, ingredients, allergens, nutritional_info, stock) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', productos)

conn.commit()
conn.close()

print(f"Base de datos actualizada con {len(productos)} productos organizados por proveedores:")
print("- Bimbo: 7 productos")
print("- Gamesa: 7 productos") 
print("- Sabritas: 7 productos")
print("- La Costeña: 7 productos")
print("- Barcel: 6 productos")
print("\nTotal: 34 productos en la base de datos")