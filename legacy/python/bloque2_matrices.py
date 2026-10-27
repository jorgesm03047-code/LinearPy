import streamlit as st
import sympy as sp
from tutor_componente import (
    render_latex,
    render_matrix_latex,
    gauss_jordan_steps,
    det_step_by_step,
    inverse_step_by_step,
)



# Bloque 2 : Matrices y Sistemas de Ecuaciones Lineales

def mostrar_bloque2():
    st.markdown('<p class="page-title">Matrices y Sistemas de Ecuaciones</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="page-subtitle">'
        "Este modulo proporciona herramientas para el analisis matricial y la "
        "resolucion de Sistemas de Ecuaciones Lineales (SEL). Permite ingresar "
        "matrices de tamano variable (desde 2x2 hasta 5x5) y calcula de forma "
        "simbolica exacta, mostrando todos los pasos de la resolucion: determinantes mediante "
        "desarrollo por cofactores, la inversa usando la adjunta, y el algoritmo de "
        "eliminacion de Gauss-Jordan con todas las operaciones elementales de fila en tiempo real."
        "</p>",
        unsafe_allow_html=True,
    )

    tab_mat, tab_sel, tab_li = st.tabs(
        ["Operaciones Matriciales", "Sistemas de Ecuaciones", "Independencia Lineal"]
    )

    # TAB 1: Matrices
    with tab_mat:
        st.markdown('<div class="section-label">Configuracion de la matriz</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "Configure las dimensiones de la matriz A y rellene sus entradas. "
            "El sistema calculara paso a paso el determinante, la inversa y la "
            "Forma Escalonada Reducida por Filas (RREF) mostrando las operaciones elementales de renglon."
            "</div>",
            unsafe_allow_html=True,
        )

        c_dim1, c_dim2, _ = st.columns([1, 1, 3])
        with c_dim1:
            m = st.number_input("Filas (m)", 2, 5, 3, key="mat_m", help="Numero de filas de la matriz")
        with c_dim2:
            n = st.number_input("Columnas (n)", 2, 5, 3, key="mat_n", help="Numero de columnas de la matriz")

        filas_data = []
        for i in range(m):
            cols = st.columns(n)
            fila = []
            for j in range(n):
                val = cols[j].text_input(
                    f"a{i+1}{j+1}",
                    value="1" if i == j else "0",
                    key=f"m_{i}_{j}",
                    label_visibility="collapsed",
                )
                fila.append(val)
            filas_data.append(fila)

        try:
            A = sp.Matrix([[sp.sympify(v) for v in row] for row in filas_data])
        except Exception as exc:
            st.error(f"Error al leer la matriz: {exc}")
            return

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown('<div class="section-label">Matriz ingresada</div>', unsafe_allow_html=True)
        st.latex("A = " + sp.latex(A))

        if m == n:
            st.markdown('<hr class="sep">', unsafe_allow_html=True)
            st.markdown("### 1. Determinante Paso a Paso")
            st.markdown(
                "El determinante se calcula mediante el desarrollo por cofactores "
                "de la primera fila. Se multiplica cada elemento por el determinante "
                "de la submatriz que queda al eliminar su fila y columna, alternando signos:"
            )
            det_steps = det_step_by_step(A)
            for step in det_steps:
                st.latex(step)
            det_val = A.det()

            if det_val != 0:
                st.markdown('<hr class="sep">', unsafe_allow_html=True)
                st.markdown("### 2. Matriz Inversa Paso a Paso (Metodo de la Adjunta)")
                st.markdown(
                    "Dado que el determinante es diferente de cero, la matriz es invertible. "
                    "Se calcula utilizando la formula: "
                    r"$$A^{-1} = \frac{1}{\det(A)} \text{Adj}(A)$$"
                )
                inv_steps = inverse_step_by_step(A)
                for desc, mat in inv_steps:
                    st.markdown(f"**{desc}**")
                    st.latex(sp.latex(mat))
            else:
                st.markdown('<span class="badge-err">Matriz singular. No se puede calcular la inversa porque det(A) = 0.</span>', unsafe_allow_html=True)

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown("### 3. Reduccion de Gauss-Jordan Paso a Paso (RREF)")
        st.markdown(
            "A continuacion, se muestra la secuencia de operaciones elementales por fila para "
            "llevar la matriz a su Forma Escalonada Reducida por Filas (RREF):"
        )
        gj_steps = gauss_jordan_steps(A, augment_cols=0)
        for idx, (desc, mat) in enumerate(gj_steps):
            st.markdown(f"**Paso {idx}: {desc}**")
            st.latex(sp.latex(mat))

        rref_mat, pivots = A.rref()
        st.markdown(f"**Columnas pivote finales:** {list(pivots)}  --  **Rango de A:** {len(pivots)}")

    # TAB 2: Sistemas de Ecuaciones
    with tab_sel:
        st.markdown('<div class="section-label">Sistema de ecuaciones lineales</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "Ingrese la matriz aumentada [A|b] del sistema de ecuaciones lineales. "
            "La ultima columna corresponde al vector de terminos independientes b. "
            "Se resolvera el sistema mostrando cada operacion elemental por fila "
            "sobre la matriz aumentada, y luego se aplicara el Teorema de Rouché-Frobenius."
            "</div>",
            unsafe_allow_html=True,
        )

        c1, c2, _ = st.columns([1, 1, 3])
        with c1:
            n_eq = st.number_input("Numero de ecuaciones", 2, 5, 3, key="sel_eq",
                                   help="Cantidad de ecuaciones del sistema")
        with c2:
            n_var = st.number_input("Numero de incognitas", 2, 5, 3, key="sel_var",
                                    help="Cantidad de variables desconocidas")

        st.markdown("**Matriz aumentada [A | b]** (la ultima columna es b):")
        aug_data = []
        for i in range(n_eq):
            cols = st.columns(n_var + 1)
            row = []
            for j in range(n_var + 1):
                label = f"b{i+1}" if j == n_var else f"a{i+1}{j+1}"
                val = cols[j].text_input(
                    label,
                    value="0",
                    key=f"sel_{i}_{j}",
                    label_visibility="collapsed",
                )
                row.append(val)
            aug_data.append(row)

        try:
            Aug = sp.Matrix([[sp.sympify(v) for v in row] for row in aug_data])
        except Exception as exc:
            st.error(f"Error: {exc}")
            return

        A_coef = Aug[:, :n_var]
        b_vec = Aug[:, n_var]

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown("**Matriz aumentada inicial:**")
        st.latex(r"[A \mid \vec{b}] = " + render_matrix_latex(Aug, augment_cols=1))

        st.markdown("### Reduccion Gauss-Jordan de la Matriz Aumentada")
        sel_steps = gauss_jordan_steps(Aug, augment_cols=1)
        for idx, (desc, mat) in enumerate(sel_steps):
            st.markdown(f"**Paso {idx}: {desc}**")
            st.latex(render_matrix_latex(mat, augment_cols=1))

        # Analisis final
        Aug_rref, pivots_aug = Aug.rref()
        A_rref, pivots_A = A_coef.rref()
        rango_A = len(pivots_A)
        rango_Aug = len(pivots_aug)

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown("### Analisis segun Teorema de Rouche-Frobenius")
        st.markdown(f"**Rango de la matriz de coeficientes A:** {rango_A}")
        st.markdown(f"**Rango de la matriz aumentada [A|b]:** {rango_Aug}")
        st.markdown(f"**Numero de incognitas (n):** {n_var}")

        if rango_A != rango_Aug:
            st.markdown(
                '<span class="badge-err">Sistema Incompatible (sin solucion): '
                "rango(A) != rango(A|b). Al menos una de las filas reducidas genera una "
                "contradiccion de la forma 0 = c (con c != 0).</span>",
                unsafe_allow_html=True,
            )
            # Mostrar la contradiccion
            st.latex(r"0 = " + sp.latex(Aug_rref[rango_Aug-1, n_var]))
        elif rango_A == n_var:
            st.markdown(
                '<span class="badge-ok">Sistema Compatible Determinado (solucion unica): '
                "rango(A) = rango(A|b) = n. Todas las variables quedan determinadas de forma unica.</span>",
                unsafe_allow_html=True,
            )
            variables = sp.symbols(f"x1:{n_var + 1}")
            sol = sp.linsolve((A_coef, b_vec), *variables)
            if sol:
                st.markdown("**Solucion Unica:**")
                for s in sol:
                    for var, val in zip(variables, s):
                        st.latex(f"{sp.latex(var)} = {sp.latex(val)}")
        else:
            grados_lib = n_var - rango_A
            st.markdown(
                f'<span class="badge-ok">Sistema Compatible Indeterminado: '
                f"rango(A) = rango(A|b) = {rango_A} &lt; n = {n_var}. "
                f"El sistema tiene {grados_lib} variable(s) libre(s), produciendo infinitas soluciones.</span>",
                unsafe_allow_html=True,
            )
            variables = sp.symbols(f"x1:{n_var + 1}")
            sol = sp.linsolve((A_coef, b_vec), *variables)
            if sol:
                st.markdown("**Solucion parametrizada:**")
                for s in sol:
                    for var, val in zip(variables, s):
                        st.latex(f"{sp.latex(var)} = {sp.latex(val)}")

    # TAB 3: Independencia Lineal
    with tab_li:
        st.markdown('<div class="section-label">Dependencia e independencia lineal</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "Ingrese un conjunto de vectores. Los colocaremos como filas de una "
            "matriz M y aplicaremos reduccion por filas para determinar el rango y "
            "los pivotes. Si el rango es igual a la cantidad de vectores, son "
            "Linealmente Independientes (LI); de lo contrario, son Linealmente Dependientes (LD)."
            "</div>",
            unsafe_allow_html=True,
        )

        c1, c2, _ = st.columns([1, 1, 3])
        with c1:
            n_vecs = st.number_input("Cantidad de vectores", 2, 5, 3, key="li_n",
                                     help="Cuantos vectores desea analizar")
        with c2:
            dim = st.number_input("Dimension de cada vector", 2, 5, 3, key="li_d",
                                  help="Numero de componentes de cada vector")

        vec_data = []
        for i in range(n_vecs):
            cols = st.columns(dim)
            row = []
            for j in range(dim):
                val = cols[j].text_input(
                    f"v{i+1}_{j+1}",
                    value="1" if i == j else "0",
                    key=f"li_{i}_{j}",
                    label_visibility="collapsed",
                )
                row.append(val)
            vec_data.append(row)

        try:
            M = sp.Matrix([[sp.sympify(v) for v in row] for row in vec_data])
        except Exception as exc:
            st.error(f"Error: {exc}")
            return

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown("**Matriz M de vectores (por filas):**")
        st.latex("M = " + sp.latex(M))

        st.markdown("### Reduccion Gauss-Jordan para Independencia Lineal")
        li_steps = gauss_jordan_steps(M, augment_cols=0)
        for idx, (desc, mat) in enumerate(li_steps):
            st.markdown(f"**Paso {idx}: {desc}**")
            st.latex(sp.latex(mat))

        rref_M, pivots_M = M.rref()
        rango = len(pivots_M)

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown(f"**Rango de M (Numero de Pivotes):** {rango}")
        st.markdown(f"**Numero de vectores:** {n_vecs}")

        if rango == n_vecs:
            st.markdown(
                '<span class="badge-ok">Los vectores son Linealmente Independientes (LI). '
                "El rango coincide con el numero de vectores, lo que significa que "
                "ninguno de ellos se puede expresar como combinacion lineal de los otros.</span>",
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                '<span class="badge-err">Los vectores son Linealmente Dependientes (LD). '
                f"El rango ({rango}) es menor que la cantidad de vectores ({n_vecs}), "
                "lo que demuestra que al menos uno de ellos es redundante y es combinacion lineal de los demas.</span>",
                unsafe_allow_html=True,
            )
