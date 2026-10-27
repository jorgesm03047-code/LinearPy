import streamlit as st
import sympy as sp
from tutor_componente import (
    render_latex,
    render_matrix_latex,
    gauss_jordan_steps,
    det_step_by_step,
    inverse_step_by_step,
)



# Bloque 4 : Diagonalizacion y Teoria Espectral

def mostrar_bloque4():
    st.markdown('<p class="page-title">Diagonalizacion y Analisis Espectral</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="page-subtitle">'
        "La diagonalizacion es el proceso de encontrar una matriz diagonal D y una "
        "matriz invertible P tales que A = P D P^-1. Este modulo ofrece un analisis "
        "espectral detallado paso a paso, desde la expansion del polinomio caracteristico "
        "hasta la resolucion de cada espacio propio y la inversion de la matriz de autovectores."
        "</p>",
        unsafe_allow_html=True,
    )

    # Configuracion
    st.markdown('<div class="section-label">Configuracion de la matriz cuadrada</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="card">'
        "Ingrese los elementos de la matriz cuadrada A. Modifique la dimension n "
        "para analizar matrices de 2x2 a 5x5."
        "</div>",
        unsafe_allow_html=True,
    )

    dim = st.number_input("Dimension n (matriz cuadrada n x n)", 2, 5, 3, key="eig_n",
                          help="Tamano de la matriz cuadrada a analizar")

    mat_data = []
    for i in range(dim):
        cols = st.columns(dim)
        row = []
        for j in range(dim):
            val = cols[j].text_input(
                f"a{i+1}{j+1}",
                value="1" if i == j else "0",
                key=f"eig_{i}_{j}",
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
    st.latex("A = " + sp.latex(A))


    # FASE 1: Polinomio Caracteristico

    st.markdown('<hr class="sep">', unsafe_allow_html=True)
    st.markdown('<div class="section-label">Fase 1: Polinomio caracteristico</div>', unsafe_allow_html=True)
    st.markdown(
        "El polinomio caracteristico se obtiene calculando el determinante de la "
        "matriz (A - lambda I), cuyas raices son los autovalores de A:"
    )

    lam = sp.Symbol("lambda")
    I = sp.eye(dim)
    A_lI = A - lam * I

    st.markdown("**Matriz $A - \\lambda I$:**")
    st.latex(sp.latex(A_lI))

    st.markdown("**Calculo del determinante paso a paso:**")
    char_steps = det_step_by_step(A_lI)
    for step in char_steps:
        st.latex(step)

    char_poly = A.charpoly(lam).as_expr()
    st.markdown("**Polinomio caracteristico simplificado:**")
    st.latex(r"p(\lambda) = " + sp.latex(char_poly) + " = 0")


    # FASE 2: Autovalores y Autovectores

    st.markdown('<hr class="sep">', unsafe_allow_html=True)
    st.markdown('<div class="section-label">Fase 2: Autovalores y espacios propios paso a paso</div>', unsafe_allow_html=True)
    st.markdown(
        "Para cada autovalor $\\lambda_i$, sustituimos su valor en $(A - \\lambda_i I)\\vec{x} = \\vec{0}$ "
        "y aplicamos Gauss-Jordan para obtener una base del subespacio propio (eigenspace)."
    )

    eigen_info = A.eigenvects()
    es_diagonalizable = True

    for idx_e, (e_val, alg_mult, e_vecs) in enumerate(eigen_info):
        geo_mult = len(e_vecs)
        with st.container(border=True):
            st.markdown(f"### Autovalor $\\lambda_{{{idx_e+1}}} = {sp.latex(e_val)}$")
            st.markdown(f"Multiplicidad algebraica (m.a.): **{alg_mult}**")
            st.markdown(f"Multiplicidad geometrica (m.g.): **{geo_mult}**")

            # Sustituir lambda
            A_sub = A - e_val * I
            st.markdown(f"**Matriz $A - ({sp.latex(e_val)})I$:**")
            st.latex(sp.latex(A_sub))

            # Gauss-Jordan homogeneo
            zero_col = sp.zeros(dim, 1)
            Aug_sub = A_sub.row_join(zero_col)
            st.markdown("**Paso a paso de la reduccion por filas:**")
            sub_steps = gauss_jordan_steps(Aug_sub, augment_cols=1)
            for idx_s, (desc, mat) in enumerate(sub_steps):
                st.markdown(f"**Paso {idx_s}: {desc}**")
                st.latex(render_matrix_latex(mat, augment_cols=1))

            st.markdown("**Autovectores generadores (Base del espacio propio):**")
            for idx_v, vec in enumerate(e_vecs):
                st.latex(f"\\vec{{v}}_{{{idx_v+1}}} = " + sp.latex(vec))

            if alg_mult != geo_mult:
                st.markdown(
                    '<span class="badge-err">'
                    "m.a. != m.g. -- Este autovalor contribuye a que la matriz sea defectiva. "
                    "La dimension del espacio propio es menor que su multiplicidad algebraica."
                    "</span>",
                    unsafe_allow_html=True,
                )
                es_diagonalizable = False


    # FASE 3: Diagnostico de Diagonalizacion

    st.markdown('<hr class="sep">', unsafe_allow_html=True)
    st.markdown('<div class="section-label">Fase 3: Diagnostico de diagonalizacion</div>', unsafe_allow_html=True)

    if es_diagonalizable:
        st.markdown(
            '<span class="badge-ok">'
            "La matriz ES diagonalizable. Existe una base completa de autovectores "
            "linealmente independientes."
            "</span>",
            unsafe_allow_html=True,
        )

        try:
            P_cols = []
            D_diag = []
            for e_val, alg_mult, e_vecs in eigen_info:
                for vec in e_vecs:
                    P_cols.append(vec)
                    D_diag.append(e_val)
            P = sp.Matrix.hstack(*P_cols)
            D = sp.diag(*D_diag)
        except Exception:
            st.error("No se pudo construir la factorizacion numerica.")
            return

        st.markdown(
            "Construimos las matrices de la descomposicion canonica $A = P D P^{-1}$:\\\n"
            "- **P**: matriz modal (columnas formadas por los autovectores en el orden analizado).\\\n"
            "- **D**: matriz diagonal (elementos de la diagonal principal formados por los autovalores)."
        )

        st.latex(r"A = P \, D \, P^{-1}")

        col_p_mat, col_d_mat = st.columns(2)
        with col_p_mat:
            st.markdown("**Matriz P (Autovectores):**")
            st.latex("P = " + sp.latex(P))
        with col_d_mat:
            st.markdown("**Matriz D (Diagonal):**")
            st.latex("D = " + sp.latex(D))

        st.markdown("### Calculo de $P^{-1}$ Paso a Paso")
        st.markdown("Calculamos la inversa de la matriz modal $P$ aplicando el metodo de la adjunta:")
        p_inv_steps = inverse_step_by_step(P)
        for desc, mat in p_inv_steps:
            st.markdown(f"**{desc}**")
            st.latex(sp.latex(mat))

        P_inv = P.inv()

        st.markdown("### Verificacion de la Multiplicacion $P D P^{-1}$")
        PD = P * D
        st.markdown("**1. Multiplicacion $P \cdot D$:**")
        st.latex(sp.latex(P) + r"\cdot" + sp.latex(D) + " = " + sp.latex(PD))

        PDP_inv = PD * P_inv
        st.markdown("**2. Multiplicacion $(PD) \cdot P^{-1}$:**")
        st.latex(sp.latex(PD) + r"\cdot" + sp.latex(P_inv) + " = " + sp.latex(PDP_inv))

        verificacion = sp.simplify(PDP_inv - A)
        if verificacion.equals(sp.zeros(dim)):
            st.markdown(
                '<span class="badge-ok">Verificacion computacional exitosa: P D P^-1 - A = 0. La factorizacion es exacta y correcta.</span>',
                unsafe_allow_html=True,
            )
    else:
        st.markdown(
            '<span class="badge-err">'
            "La matriz es DEFECTIVA y no es diagonalizable sobre los reales. "
            "Al menos un autovalor tiene multiplicidad geometrica menor "
            "que su multiplicidad algebraica, impidiendo reunir n autovectores independientes."
            "</span>",
            unsafe_allow_html=True,
        )
