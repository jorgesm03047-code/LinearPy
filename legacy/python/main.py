import streamlit as st


# LinearPy  |  Punto de entrada unico


st.set_page_config(
    page_title="LinearPy  -  Algebra Lineal",
    page_icon="L",
    layout="wide",
    initial_sidebar_state="expanded",
)

# CSS global
st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Base */
html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

/* Forzar texto oscuro en el area principal */
section.main .block-container,
section.main .block-container p,
section.main .block-container span,
section.main .block-container li,
section.main .block-container label,
section.main .block-container div,
section.main .block-container h1,
section.main .block-container h2,
section.main .block-container h3,
section.main .block-container h4 {
    color: #1a1a2e;
}

/* Forzar estilo de enlaces para que resalten y sean clickeables */
section.main .block-container a {
    color: #4361ee !important;
    text-decoration: underline !important;
    font-weight: 600;
}

/* Sidebar */
section[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}
section[data-testid="stSidebar"] h1,
section[data-testid="stSidebar"] h2,
section[data-testid="stSidebar"] h3,
section[data-testid="stSidebar"] p,
section[data-testid="stSidebar"] span,
section[data-testid="stSidebar"] label,
section[data-testid="stSidebar"] .stRadio label,
section[data-testid="stSidebar"] .stCaption,
section[data-testid="stSidebar"] small {
    color: #d0d0d0 !important;
}
section[data-testid="stSidebar"] .stRadio label:hover {
    color: #ffffff !important;
}

/* Cards */
.card {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px 28px;
    margin: 12px 0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    border: 1px solid #e8e8e8;
    color: #1a1a2e;
}
.card p, .card b, .card span {
    color: #1a1a2e;
}
.card-accent {
    border-left: 4px solid #4361ee;
}

/* Estilo premium para los st.container(border=True) nativos de Streamlit */
div[data-testid="stVerticalBlockBorderWrapper"] {
    background: #ffffff !important;
    border-radius: 12px !important;
    padding: 24px 28px !important;
    margin: 12px 0 !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important;
    border: 1px solid #e8e8e8 !important;
    border-left: 4px solid #4361ee !important; /* Estilo card-accent nativo! */
}

/* Headers */
.page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a2e !important;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
}
.page-subtitle {
    font-size: 1rem;
    color: #6c757d !important;
    margin-bottom: 28px;
    font-weight: 400;
    line-height: 1.7;
}
.section-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #4361ee !important;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 6px;
}

/* Badges */
.badge-ok {
    display: inline-block;
    background: #d4edda;
    color: #155724 !important;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 0.82rem;
    font-weight: 500;
}
.badge-err {
    display: inline-block;
    background: #f8d7da;
    color: #721c24 !important;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 0.82rem;
    font-weight: 500;
}

/* Dividers */
.sep {
    border: none;
    border-top: 1px solid #e8e8e8;
    margin: 28px 0;
}

/* Buttons */
.stButton > button {
    border-radius: 8px;
    font-weight: 500;
    padding: 0.45rem 1.6rem;
    transition: all 0.15s ease;
}

/* Tabs */
.stTabs [data-baseweb="tab-list"] button p,
.stTabs [data-baseweb="tab-list"] button {
    color: #495057;
}
.stTabs [data-baseweb="tab-list"] button[aria-selected="true"] p,
.stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
    color: #4361ee;
}

/* Inputs */
.stTextInput label, .stNumberInput label, .stSlider label,
.stCheckbox label, .stSelectbox label, .stRadio label {
    color: #1a1a2e;
}

/* Video cards */
.ref-card {
    background: #ffffff;
    border-radius: 10px;
    padding: 18px 22px;
    margin: 10px 0;
    border: 1px solid #e8e8e8;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    color: #1a1a2e;
}
.ref-card a {
    color: #4361ee;
    text-decoration: none;
    font-weight: 500;
}
.ref-card a:hover {
    text-decoration: underline;
}
</style>
""",
    unsafe_allow_html=True,
)

# Imports de bloques
from bloque1_vectores import mostrar_bloque1
from bloque2_matrices import mostrar_bloque2
from bloque3_transformaciones import mostrar_bloque3
from bloque4_diagonalizacion import mostrar_bloque4


def main():
    # Sidebar
    with st.sidebar:
        st.markdown("## LinearPy")
        st.caption("Algebra Lineal y Geometria Analitica")
        st.markdown("---")

        pagina = st.radio(
            "Modulo",
            [
                "Inicio",
                "Cap. 1 -- Vectores y Geometria",
                "Cap. 2 -- Matrices y Sistemas",
                "Cap. 3 -- Transformaciones Lineales",
                "Cap. 4 -- Diagonalizacion",
                "Referencias y Videos",
            ],
            label_visibility="collapsed",
        )

        st.markdown("---")
        st.caption("Motor simbolico: SymPy")
        st.caption("Graficas: Plotly / Matplotlib")

    # Router
    if pagina == "Inicio":
        _pagina_inicio()
    elif pagina.startswith("Cap. 1"):
        mostrar_bloque1()
    elif pagina.startswith("Cap. 2"):
        mostrar_bloque2()
    elif pagina.startswith("Cap. 3"):
        mostrar_bloque3()
    elif pagina.startswith("Cap. 4"):
        mostrar_bloque4()
    elif pagina == "Referencias y Videos":
        _pagina_referencias()


# Pagina de bienvenida
def _pagina_inicio():
    st.markdown('<p class="page-title">Bienvenido a LinearPy</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="page-subtitle">'
        "LinearPy es una plataforma de calculo simbolico y visualizacion interactiva "
        "disenada como complemento didactico para el curso universitario de "
        "Algebra Lineal y Geometria Analitica. Cada modulo aborda un eje tematico "
        "del programa oficial, ofreciendo herramientas de computo exacto mediante "
        "el motor de algebra computacional SymPy, asi como representaciones graficas "
        "tridimensionales y bidimensionales interactivas construidas con Plotly. "
        "El objetivo es que el estudiante pueda verificar sus calculos manuales, "
        "explorar geometricamente los conceptos y profundizar en la intuicion "
        "detras de las estructuras algebraicas."
        "</p>",
        unsafe_allow_html=True,
    )

    c1, c2, c3, c4 = st.columns(4)
    cards = [
        ("Cap. 1", "Vectores, rectas y planos",
         "Magnitud, unitario, cosenos directores, producto escalar y cruz, "
         "ecuaciones de rectas y planos, y visualizacion 3D interactiva."),
        ("Cap. 2", "Matrices y sistemas",
         "Cuadricula dinamica de matrices, Gauss-Jordan paso a paso, "
         "determinantes, inversas, Rouche-Frobenius e independencia lineal."),
        ("Cap. 3", "Transformaciones lineales",
         "Nucleo, imagen, Teorema de la Dimension y un simulador 2D "
         "de rotacion, escala, reflexion y cizallamiento en tiempo real."),
        ("Cap. 4", "Diagonalizacion",
         "Polinomio caracteristico, autovalores, autovectores, multiplicidades "
         "y descomposicion canonica A = P D P^-1 con fracciones exactas."),
    ]
    for col, (title, subtitle, desc) in zip([c1, c2, c3, c4], cards):
        with col:
            st.markdown(
                f'<div class="card card-accent">'
                f'<div class="section-label">{title}</div>'
                f"<p style='font-size:0.95rem;font-weight:600;color:#1a1a2e;margin:4px 0 8px 0'>{subtitle}</p>"
                f"<p style='font-size:0.85rem;color:#495057;margin:0;line-height:1.6'>{desc}</p>"
                f"</div>",
                unsafe_allow_html=True,
            )

    st.markdown('<hr class="sep">', unsafe_allow_html=True)

    st.markdown(
        '<div class="card">'
        "<b>Precision simbolica:</b>  Todas las operaciones internas se ejecutan "
        "con SymPy, devolviendo fracciones exactas, raices y expresiones analiticas "
        "sin perdida por redondeo de coma flotante. Los resultados se renderizan "
        "nativamente en LaTeX. Esto permite que el estudiante compare directamente "
        "las soluciones de la plataforma con su trabajo manual, ya que ambos operan "
        "sobre la misma aritmetica racional y simbolica.<br><br>"
        "<b>Visualizacion interactiva:</b>  Cada modulo geometrico cuenta con "
        "graficos que el usuario puede rotar, acercar y manipular libremente. "
        "El laboratorio 2D del Capitulo 3 permite modificar parametros con "
        "controles deslizantes y observar la deformacion del espacio en tiempo real."
        "</div>",
        unsafe_allow_html=True,
    )


# Pagina de referencias y videos
def _pagina_referencias():
    st.markdown('<p class="page-title">Referencias y Material de Video</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="page-subtitle">'
        "Recopilacion de recursos audiovisuales recomendados para complementar "
        "el estudio de cada tema del programa. Los videos provienen de canales "
        "reconocidos por su rigor matematico y calidad pedagogica: 3Blue1Brown "
        "(serie Essence of Linear Algebra), Khan Academy, Professor Leonard, "
        "y otros creadores especializados en matematicas universitarias."
        "</p>",
        unsafe_allow_html=True,
    )

    # Capitulo 1
    st.markdown("### Capitulo 1: Vectores y Geometria Analitica")
    _video_ref(
        "Vectores, que son y para que sirven (Essence of Linear Algebra, Cap. 1)",
        "https://www.youtube.com/watch?v=fNk_zzaMoSs",
        "3Blue1Brown introduce el concepto de vector desde multiples perspectivas: "
        "como flecha en el espacio, como lista de numeros, y como elemento de un espacio vectorial."
    )
    _video_ref(
        "Combinaciones lineales, span y bases",
        "https://www.youtube.com/watch?v=k7RM-ot2NWY",
        "Visualizacion geometrica de que significa combinar vectores linealmente, "
        "como el span cubre un subespacio, y por que las bases son el conjunto minimo generador."
    )
    _video_ref(
        "Producto punto y producto cruz",
        "https://www.youtube.com/watch?v=LyGKycYT2v0",
        "Explicacion visual del producto escalar como proyeccion y del producto cruz "
        "como area del paralelogramo, incluyendo la regla de la mano derecha."
    )
    _video_ref(
        "Ecuaciones de rectas y planos en el espacio",
        "https://www.youtube.com/watch?v=_MVr1-ys1cs",
        "Professor Leonard explica paso a paso como derivar la ecuacion vectorial, "
        "parametrica y simetrica de una recta, asi como la ecuacion general del plano."
    )

    st.markdown('<hr class="sep">', unsafe_allow_html=True)

    # Capitulo 2
    st.markdown("### Capitulo 2: Matrices y Sistemas de Ecuaciones")
    _video_ref(
        "Eliminacion Gaussiana y Gauss-Jordan",
        "https://www.youtube.com/watch?v=eYSASx8_nyg",
        "Procedimiento completo de reduccion por filas: operaciones elementales, "
        "forma escalonada y forma escalonada reducida, con multiples ejemplos."
    )
    _video_ref(
        "Determinantes (Essence of Linear Algebra, Cap. 6)",
        "https://www.youtube.com/watch?v=Ip3X9LOh2dk",
        "3Blue1Brown muestra que el determinante mide como una transformacion lineal "
        "escala areas y volumenes, dando una interpretacion geometrica profunda."
    )
    _video_ref(
        "Matriz inversa, espacio columna y espacio nulo",
        "https://www.youtube.com/watch?v=uQhTuRlWMxw",
        "Que significa que una matriz sea invertible, como se relaciona con la "
        "existencia de soluciones, y la geometria del espacio nulo y columna."
    )
    _video_ref(
        "Sistemas de ecuaciones y el Teorema de Rouche-Frobenius",
        "https://www.youtube.com/watch?v=OmJ-4B-mS-Y",
        "Criterio formal para clasificar un sistema como compatible determinado, "
        "compatible indeterminado o incompatible, usando rangos de matrices."
    )

    st.markdown('<hr class="sep">', unsafe_allow_html=True)

    # Capitulo 3
    st.markdown("### Capitulo 3: Transformaciones Lineales")
    _video_ref(
        "Transformaciones lineales (Essence of Linear Algebra, Cap. 3)",
        "https://www.youtube.com/watch?v=kYB8IZa5AuE",
        "Visualizacion animada de como las transformaciones lineales mueven el espacio "
        "completo: las lineas de cuadricula permanecen rectas y paralelas, y el origen no se mueve."
    )
    _video_ref(
        "Nucleo e imagen de una transformacion lineal",
        "https://www.youtube.com/watch?v=uQhTuRlWMxw",
        "Explicacion del kernel (que vectores colapsan al cero) y la imagen "
        "(que vectores son alcanzables), con ejemplos concretos de matrices 2x3 y 3x2."
    )
    _video_ref(
        "Teorema de la Dimension (Rango-Nulidad)",
        "https://www.youtube.com/watch?v=JVDrlTdzxiI",
        "Demostracion intuitiva de que la dimension del dominio es siempre igual a la "
        "suma de la dimension del nucleo mas la dimension de la imagen."
    )

    st.markdown('<hr class="sep">', unsafe_allow_html=True)

    # Capitulo 4
    st.markdown("### Capitulo 4: Diagonalizacion")
    _video_ref(
        "Autovalores y autovectores (Essence of Linear Algebra, Cap. 14)",
        "https://www.youtube.com/watch?v=PFDu9oVAE-g",
        "3Blue1Brown explica visualmente que significa que un vector no cambie de direccion "
        "bajo una transformacion, solo se escale: ese factor de escala es el autovalor."
    )
    _video_ref(
        "Polinomio caracteristico y calculo de eigenvalores",
        "https://www.youtube.com/watch?v=PhfbEr2btGQ",
        "Procedimiento detallado para construir det(A - lambda I) = 0, encontrar las raices, "
        "y calcular los autovectores asociados para matrices 2x2 y 3x3."
    )
    _video_ref(
        "Diagonalizacion de matrices",
        "https://www.youtube.com/watch?v=mB5HXBCKcEI",
        "Cuando y como una matriz se puede descomponer como A = P D P^-1. Se cubren los "
        "criterios de multiplicidad algebraica vs geometrica y la construccion explicita de P y D."
    )
    _video_ref(
        "Matrices defectivas y por que no se pueden diagonalizar",
        "https://www.youtube.com/watch?v=LHSEdG02ZVw",
        "Analisis de los casos donde la multiplicidad geometrica es menor que la algebraica, "
        "lo cual impide formar una base completa de autovectores."
    )

    st.markdown('<hr class="sep">', unsafe_allow_html=True)

    # Recursos generales
    st.markdown("### Recursos Generales")
    _video_ref(
        "Essence of Linear Algebra (Serie completa) -- 3Blue1Brown",
        "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
        "La serie mas recomendada de todo Internet para construir intuicion geometrica "
        "sobre los conceptos fundamentales del algebra lineal. 16 capitulos animados."
    )
    _video_ref(
        "Algebra Lineal -- Khan Academy (en espanol)",
        "https://es.khanacademy.org/math/linear-algebra",
        "Curso completo y gratuito en espanol con ejercicios interactivos, ideal para "
        "repasar temas especificos y practicar problemas."
    )
    _video_ref(
        "MIT OpenCourseWare 18.06 -- Linear Algebra (Gilbert Strang)",
        "https://www.youtube.com/playlist?list=PL49CF3715CB9EF31D",
        "El legendario curso de Gilbert Strang en el MIT. 34 clases completas con un "
        "enfoque que combina rigor matematico con aplicaciones practicas."
    )


def _video_ref(titulo: str, url: str, descripcion: str):
    """Renderiza una tarjeta de referencia de video."""
    st.markdown(
        f'<div class="ref-card">'
        f'<a href="{url}" target="_blank" style="color: #4361ee !important; text-decoration: underline !important; font-weight: 600 !important; cursor: pointer !important; z-index: 9999 !important; position: relative !important;">{titulo}</a><br>'
        f"<span style='font-size:0.85rem;color:#6c757d;line-height:1.6'>{descripcion}</span>"
        f"</div>",
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
