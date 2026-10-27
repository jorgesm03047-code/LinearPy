import streamlit as st
import sympy as sp
import plotly.graph_objects as go
import numpy as np
from tutor_componente import (
    render_latex,
    render_matrix_latex,
    gauss_jordan_steps,
)



# Bloque 3 : Transformaciones Lineales

def mostrar_bloque3():
    st.markdown('<p class="page-title">Transformaciones Lineales</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="page-subtitle">'
        "Una transformacion lineal T: V -> W es una funcion entre espacios vectoriales "
        "que preserva las operaciones de suma de vectores y multiplicacion por escalar. "
        "Este modulo analiza paso a paso los dos subespacios fundamentales asociados a T: "
        "el Nucleo (o Kernel) y la Imagen. Se desglosan los metodos de resolucion "
        "homogenea y la busqueda de pivotes, validando de manera interactiva el Teorema de la Dimension."
        "</p>",
        unsafe_allow_html=True,
    )

    tab_sub, tab_lab = st.tabs(["Nucleo e Imagen", "Laboratorio 2D"])

    # TAB 1: Nucleo e Imagen
    with tab_sub:
        st.markdown('<div class="section-label">Subespacios fundamentales</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "Dada una transformacion lineal T representada por la matriz A de dimension "
            "m x n, el Nucleo es el conjunto de soluciones al sistema homogeneo Ax = 0, "
            "y la Imagen es el espacio generado por las columnas de A. Ingrese las "
            "dimensiones y coeficientes para ver el procedimiento paso a paso."
            "</div>",
            unsafe_allow_html=True,
        )

        c1, c2, _ = st.columns([1, 1, 3])
        with c1:
            rows = st.number_input("Filas (m)", 2, 5, 2, key="tf_m",
                                   help="Dimension del codominio (espacio de llegada)")
        with c2:
            cols_n = st.number_input("Columnas (n)", 2, 5, 3, key="tf_n",
                                     help="Dimension del dominio (espacio de partida)")

        mat_data = []
        for i in range(rows):
            cs = st.columns(cols_n)
            row = []
            for j in range(cols_n):
                val = cs[j].text_input(
                    f"A{i+1}{j+1}",
                    value="1" if i == j else "0",
                    key=f"tf_{i}_{j}",
                    label_visibility="collapsed",
                )
                row.append(val)
            mat_data.append(row)

        try:
            A = sp.Matrix([[sp.sympify(v) for v in row] for row in mat_data])
        except Exception as exc:
            st.error(f"Error al leer la matriz: {exc}")
            return

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown('<div class="section-label">Matriz de la transformacion</div>', unsafe_allow_html=True)
        st.latex("A = " + sp.latex(A))

        # Nucleo paso a paso
        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown("### 1. Calculo del Nucleo (Kernel) Paso a Paso")
        st.markdown(
            "El nucleo consta de todos los vectores $\\vec{x}$ en el dominio tales que $A\\vec{x} = \\vec{0}$. "
            "Para encontrarlo, construimos el sistema homogeneo $[A \\mid \\vec{0}]$ y lo resolvemos aplicando Gauss-Jordan:"
        )

        # Matriz aumentada homogenea
        zero_col = sp.zeros(rows, 1)
        Aug = A.row_join(zero_col)
        st.latex(r"[A \mid \vec{0}] = " + render_matrix_latex(Aug, augment_cols=1))

        st.markdown("**Pasos de la reduccion por filas:**")
        ker_steps = gauss_jordan_steps(Aug, augment_cols=1)
        for idx, (desc, mat) in enumerate(ker_steps):
            st.markdown(f"**Paso {idx}: {desc}**")
            st.latex(render_matrix_latex(mat, augment_cols=1))

        # RREF final
        Aug_rref, pivots = Aug.rref()
        dim_ker = cols_n - len(pivots)

        st.markdown("**Analisis de la Forma Escalonada Reducida:**")
        st.markdown(f"Columnas pivote (variables principales): **{list(pivots)}**")
        free_vars = [i for i in range(cols_n) if i not in pivots]
        st.markdown(f"Columnas no pivote (variables libres): **{free_vars}**")

        st.markdown("**Base resultante del Nucleo:**")
        ker_basis = A.nullspace()
        if ker_basis:
            for idx_k, vec in enumerate(ker_basis):
                st.latex(f"\\vec{{k}}_{{{idx_k+1}}} = " + sp.latex(vec))
        else:
            st.latex(r"\ker(T) = \{\vec{0}\}")
        st.markdown(f"**Nulidad (Dimension del Nucleo):** {dim_ker}")

        # Imagen paso a paso
        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown("### 2. Calculo de la Imagen Paso a Paso")
        st.markdown(
            "La Imagen de la transformacion es generada por las columnas de la matriz $A$. "
            "Las columnas de $A$ correspondientes a las columnas pivote en la forma RREF forman una **base** de la Imagen. "
            "Este metodo garantiza que los vectores base elegidos sean linealmente independientes."
        )

        st.markdown(f"De acuerdo con la RREF obtenida, los pivotes estan en las columnas: **{list(pivots)}**")

        im_basis = A.columnspace()
        dim_im = len(im_basis)

        if im_basis:
            st.markdown("**Base resultante de la Imagen (tomando las columnas correspondientes de la matriz original A):**")
            for idx_im, p_col in enumerate(pivots):
                st.markdown(f"Columna original {p_col + 1} de $A$:")
                st.latex(f"\\vec{{i}}_{{{idx_im+1}}} = " + sp.latex(A.col(p_col)))
        else:
            st.latex(r"\text{Im}(T) = \{\vec{0}\}")
        st.markdown(f"**Rango (Dimension de la Imagen):** {dim_im}")

        # Verificacion teorema dimension
        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown("### 3. Verificacion del Teorema de la Dimension")
        st.markdown(
            "El Teorema de la Dimension (o Rango-Nulidad) establece que: "
            r"$$\dim(\ker T) + \dim(\text{Im}\, T) = \dim(V)$$"
            "Donde $V$ es el espacio de partida (dominio)."
        )
        st.latex(rf"\text{{Nulidad}} + \text{{Rango}} = n")
        st.latex(f"{dim_ker} + {dim_im} = {cols_n}")

        if dim_ker + dim_im == cols_n:
            st.markdown(
                f'<span class="badge-ok">Verificado con exito: '
                f'{dim_ker} (Nulidad) + {dim_im} (Rango) = {cols_n} (Dimension del Dominio n)</span>',
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                '<span class="badge-err">Error en la verificacion matematica</span>',
                unsafe_allow_html=True,
            )

    # TAB 2: Laboratorio 2D
    with tab_lab:
        st.markdown('<div class="section-label">Simulador de deformacion geometrica</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "Este laboratorio permite observar en tiempo real como una transformacion "
            "lineal en R2 deforma un cuadrado unitario y una cuadricula de puntos "
            "internos. La figura gris es el estado original; la figura azul muestra "
            "el resultado despues de aplicar la transformacion compuesta."
            "</div>",
            unsafe_allow_html=True,
        )

        col_ctrl, col_fig = st.columns([1, 2])

        with col_ctrl:
            st.markdown("**Parametros de transformacion**")
            theta = st.slider(
                "Angulo de rotacion (grados)", -180, 180, 0,
                key="lab_theta",
                help="Angulo de rotacion en sentido antihorario. 90 grados rota un cuarto de vuelta."
            )
            sx = st.slider(
                "Escala X", 0.1, 3.0, 1.0, step=0.1,
                key="lab_sx",
                help="Factor de dilatacion horizontal. Valores menores a 1 comprimen, mayores a 1 estiran."
            )
            sy = st.slider(
                "Escala Y", 0.1, 3.0, 1.0, step=0.1,
                key="lab_sy",
                help="Factor de dilatacion vertical. Valores menores a 1 comprimen, mayores a 1 estiran."
            )
            shx = st.slider(
                "Cizallamiento X", -2.0, 2.0, 0.0, step=0.1,
                key="lab_shx",
                help="Desplazamiento horizontal proporcional a la coordenada Y del punto."
            )
            shy = st.slider(
                "Cizallamiento Y", -2.0, 2.0, 0.0, step=0.1,
                key="lab_shy",
                help="Desplazamiento vertical proporcional a la coordenada X del punto."
            )
            reflejo = st.checkbox("Reflexion respecto al eje X", key="lab_ref",
                                  help="Multiplica la coordenada Y por -1, reflejando la figura.")

        with col_fig:
            sq = np.array([[0, 1, 1, 0, 0], [0, 0, 1, 1, 0]])

            grid_pts = []
            for gx in np.linspace(0, 1, 6):
                for gy in np.linspace(0, 1, 6):
                    grid_pts.append([gx, gy])
            grid = np.array(grid_pts).T

            th = np.radians(theta)
            R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
            S = np.array([[sx, 0], [0, sy]])
            Sh = np.array([[1, shx], [shy, 1]])
            Ref = np.array([[1, 0], [0, -1]]) if reflejo else np.eye(2)

            T_total = R @ Sh @ S @ Ref
            sq_t = T_total @ sq
            grid_t = T_total @ grid

            fig = go.Figure()

            fig.add_trace(go.Scatter(
                x=sq[0], y=sq[1], fill="toself",
                fillcolor="rgba(200,200,200,0.15)", line=dict(color="#adb5bd", width=2),
                name="Original",
            ))
            fig.add_trace(go.Scatter(
                x=grid[0], y=grid[1], mode="markers",
                marker=dict(size=3, color="#adb5bd"), showlegend=False,
            ))

            fig.add_trace(go.Scatter(
                x=sq_t[0], y=sq_t[1], fill="toself",
                fillcolor="rgba(67,97,238,0.18)", line=dict(color="#4361ee", width=2.5),
                name="Transformado",
            ))
            fig.add_trace(go.Scatter(
                x=grid_t[0], y=grid_t[1], mode="markers",
                marker=dict(size=3, color="#4361ee"), showlegend=False,
            ))

            rng = 5
            fig.update_layout(
                xaxis=dict(range=[-rng, rng], dtick=1, gridcolor="#f0f0f0",
                           zerolinecolor="#ced4da", zerolinewidth=1),
                yaxis=dict(range=[-rng, rng], dtick=1, gridcolor="#f0f0f0",
                           zerolinecolor="#ced4da", zerolinewidth=1,
                           scaleanchor="x"),
                height=550,
                paper_bgcolor="white", plot_bgcolor="white",
                legend=dict(x=0, y=1.08, orientation="h"),
                margin=dict(l=40, r=20, t=40, b=40),
            )
            st.plotly_chart(fig, use_container_width=False, width="stretch")

            # Exact SymPy matrices for step-by-step display (High performance, completely lag-free)
            S_sp = sp.Matrix([[sp.Rational(str(sx)), 0], [0, sp.Rational(str(sy))]])
            Ref_sp = sp.Matrix([[1, 0], [0, -1]]) if reflejo else sp.eye(2)
            Sh_sp = sp.Matrix([[1, sp.Rational(str(shx))], [sp.Rational(str(shy)), 1]])

            # Exact symbolic rotation
            theta_sym = sp.Rational(theta, 180) * sp.pi
            c_val = sp.cos(theta_sym)
            s_val = sp.sin(theta_sym)
            R_sp = sp.Matrix([[c_val, -s_val], [s_val, c_val]])

            st.markdown("### Composicion de la Matriz de Transformacion Paso a Paso")
            st.markdown(
                "La matriz de transformacion compuesta $T$ se obtiene multiplicando las matrices de las "
                "transformaciones individuales en orden de aplicacion (de derecha a izquierda): "
                r"$$T = R \cdot Sh \cdot S \cdot Ref$$"
            )

            # Step 1: S @ Ref
            S_Ref = S_sp * Ref_sp
            st.markdown("**1. Composicion de Escala y Reflexion ($S \\cdot Ref$):**")
            st.latex(sp.latex(S_sp) + r"\cdot" + sp.latex(Ref_sp) + " = " + sp.latex(S_Ref))

            # Step 2: Sh @ (S @ Ref)
            Sh_S_Ref = Sh_sp * S_Ref
            st.markdown("**2. Composicion con Cizallamiento ($Sh \\cdot (S \\cdot Ref)$):**")
            st.latex(sp.latex(Sh_sp) + r"\cdot" + sp.latex(S_Ref) + " = " + sp.latex(Sh_S_Ref))

            # Step 3: R @ (Sh @ S @ Ref)
            T_sp = R_sp * Sh_S_Ref
            st.markdown("**3. Composicion Final con Rotacion ($T = R \\cdot (Sh \\cdot S \\cdot Ref)$):**")
            st.latex(sp.latex(R_sp) + r"\cdot" + sp.latex(Sh_S_Ref) + " = " + sp.latex(T_sp))

            det_T = T_sp.det()
            det_float = abs(float(det_T.evalf()))
            st.markdown(
                f"**Determinante:** det(T) = {sp.latex(det_T)}. "
                f"Las areas se multiplican por un factor de {det_float:.4f}."
            )
