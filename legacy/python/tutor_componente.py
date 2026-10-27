import streamlit as st
import sympy as sp


def render_latex(expr, label=None):
    """Renderiza una expresion SymPy como LaTeX limpio."""
    if label:
        st.markdown(f"**{label}**")
    st.latex(sp.latex(expr))


def render_matrix_latex(M, augment_cols=0):
    """Renderiza una matriz de SymPy con una barra vertical opcional si es aumentada."""
    if augment_cols > 0:
        m, n = M.shape
        left_cols = n - augment_cols
        fmt = "c" * left_cols + "|" + "c" * augment_cols
        rows_str = []
        for i in range(m):
            row_vals = [sp.latex(M[i, j]) for j in range(n)]
            rows_str.append(" & ".join(row_vals))
        body = " \\\\ \n".join(rows_str)
        return r"\left(\begin{array}{" + fmt + r"}" + body + r"\end{array}\right)"
    else:
        return sp.latex(M)


def render_matrix(M, augment_cols=0, label=None):
    """Muestra una matriz de SymPy con st.latex."""
    if label:
        st.markdown(f"**{label}**")
    st.latex(render_matrix_latex(M, augment_cols))


def gauss_jordan_steps(M, augment_cols=0):
    """
    Realiza la reduccion de Gauss-Jordan (RREF) registrando cada paso
    elemental de fila y devolviendo una lista de tuplas (descripcion, matriz_copia).
    """
    steps = []
    A = M.copy()
    m, n = A.shape
    r = 0
    c = 0

    steps.append(("Estado inicial:", A.copy()))

    pivot_cols = n - augment_cols
    while r < m and c < pivot_cols:
        # Buscar pivote en la columna c a partir de la fila r
        pivot_row = -1
        for i in range(r, m):
            if A[i, c] != 0:
                pivot_row = i
                break
        if pivot_row == -1:
            c += 1
            continue

        # Si el pivote no esta en la fila r, intercambiar filas
        if pivot_row != r:
            A.row_swap(r, pivot_row)
            steps.append((f"Intercambiamos la fila {r+1} con la fila {pivot_row+1} ($R_{{{r+1}}} \\leftrightarrow R_{{{pivot_row+1}}}$):", A.copy()))

        # Hacer el pivote igual a 1
        pivot_val = A[r, c]
        if pivot_val != 1:
            # Multiplicamos la fila r por 1/pivot_val
            A[r, :] = A[r, :] / pivot_val
            steps.append((f"Multiplicamos la fila {r+1} por el reciproco del pivote {sp.latex(1/pivot_val)} ($R_{{{r+1}}} \\leftarrow {sp.latex(1/pivot_val)} \\cdot R_{{{r+1}}}$):", A.copy()))

        # Eliminar las entradas en la columna c para las demas filas
        for i in range(m):
            if i != r and A[i, c] != 0:
                factor = A[i, c]
                A[i, :] = A[i, :] - factor * A[r, :]
                steps.append((f"Sumamos a la fila {i+1} la fila {r+1} multiplicada por {sp.latex(-factor)} ($R_{{{i+1}}} \\leftarrow R_{{{i+1}}} + ({sp.latex(-factor)}) \\cdot R_{{{r+1}}}$):", A.copy()))

        r += 1
        c += 1

    return steps


def det_step_by_step(M):
    """Devuelve una lista de cadenas LaTeX explicando el calculo del determinante."""
    m, n = M.shape
    if m != n:
        return [r"\text{El determinante solo se define para matrices cuadradas.}"]

    if n == 2:
        a, b = M[0, 0], M[0, 1]
        c, d = M[1, 0], M[1, 1]
        step1 = r"\det(A) = a_{11} \cdot a_{22} - a_{12} \cdot a_{21}"
        step2 = f"\\det(A) = ({sp.latex(a)})({sp.latex(d)}) - ({sp.latex(b)})({sp.latex(c)})"
        step3 = f"\\det(A) = {sp.latex(a*d)} - {sp.latex(b*c)}"
        step4 = f"\\det(A) = {sp.latex(M.det())}"
        return [step1, step2, step3, step4]

    elif n == 3:
        steps = []
        r1, r2, r3 = M[0, 0], M[0, 1], M[0, 2]

        M11 = M.minor_submatrix(0, 0)
        M12 = M.minor_submatrix(0, 1)
        M13 = M.minor_submatrix(0, 2)

        det11 = M11.det()
        det12 = M12.det()
        det13 = M13.det()

        steps.append(
            r"\det(A) = a_{11}\det(M_{11}) - a_{12}\det(M_{12}) + a_{13}\det(M_{13})"
        )
        steps.append(
            f"\\det(A) = ({sp.latex(r1)}) \\det {sp.latex(M11)} - ({sp.latex(r2)}) \\det {sp.latex(M12)} + ({sp.latex(r3)}) \\det {sp.latex(M13)}"
        )
        steps.append(
            f"\\text{{Determinantes de las submatrices 2x2:}}\\\\"
            f"\\det(M_{{11}}) = ({sp.latex(M11[0,0])})({sp.latex(M11[1,1])}) - ({sp.latex(M11[0,1])})({sp.latex(M11[1,0])}) = {sp.latex(det11)}\\\\"
            f"\\det(M_{{12}}) = ({sp.latex(M12[0,0])})({sp.latex(M12[1,1])}) - ({sp.latex(M12[0,1])})({sp.latex(M12[1,0])}) = {sp.latex(det12)}\\\\"
            f"\\det(M_{{13}}) = ({sp.latex(M13[0,0])})({sp.latex(M13[1,1])}) - ({sp.latex(M13[0,1])})({sp.latex(M13[1,0])}) = {sp.latex(det13)}"
        )
        val = r1*det11 - r2*det12 + r3*det13
        steps.append(
            f"\\det(A) = ({sp.latex(r1)})({sp.latex(det11)}) - ({sp.latex(r2)})({sp.latex(det12)}) + ({sp.latex(r3)})({sp.latex(det13)})"
        )
        steps.append(
            f"\\det(A) = {sp.latex(r1*det11)} - {sp.latex(r2*det12)} + {sp.latex(r3*det13)} = {sp.latex(val)}"
        )
        return steps

    else:
        steps = []
        term_strings = []
        expanded_parts = []
        for j in range(n):
            coeff = M[0, j]
            sign = 1 if j % 2 == 0 else -1
            submat = M.minor_submatrix(0, j)
            subdet = submat.det()
            sign_str = "+" if sign == 1 and j > 0 else "-" if sign == -1 else ""
            term_strings.append(f"{sign_str} ({sp.latex(coeff)}) \\det M_{{1,{j+1}}}")
            expanded_parts.append(f"\\det M_{{1,{j+1}}} = {sp.latex(subdet)}")

        steps.append(r"\det(A) = \sum_{j=1}^{" + str(n) + r"} (-1)^{1+j} a_{1j} \det(M_{1j})")
        steps.append(r"\det(A) = " + " ".join(term_strings))
        steps.append(r"\text{Determinantes de los submenores de dimension " + str(n-1) + r"\times" + str(n-1) + r":}\\" + r" \\ ".join(expanded_parts))

        final_sum_terms = []
        for j in range(n):
            coeff = M[0, j]
            sign = 1 if j % 2 == 0 else -1
            submat = M.minor_submatrix(0, j)
            subdet = submat.det()
            term_val = sign * coeff * subdet
            if len(term_val.free_symbols) > 0:
                sign_str = "+" if j > 0 else ""
            else:
                sign_str = "+" if term_val >= 0 and j > 0 else ""
            final_sum_terms.append(f"{sign_str}{sp.latex(term_val)}")

        steps.append(r"\det(A) = " + " ".join(final_sum_terms) + f" = {sp.latex(M.det())}")
        return steps


def inverse_step_by_step(M):
    """Retorna una lista de tuplas (explicacion, matriz_sympy) para mostrar el paso a paso de la inversa."""
    m, n = M.shape
    if m != n:
        return [("La inversa solo existe para matrices cuadradas.", M)]
    det_val = M.det()
    if det_val == 0:
        return [("El determinante es cero, por lo tanto la matriz no es invertible.", M)]

    steps = []
    # Original
    steps.append(("Matriz original:", M.copy()))
    # Transpuesta
    Mt = M.transpose()
    steps.append(("Matriz Transpuesta (intercambiar filas por columnas):", Mt.copy()))
    # Cofactores
    Cof = M.cofactor_matrix()
    steps.append(("Matriz de Cofactores (cada entrada es $(-1)^{i+j} \\det(M_{ij})$):", Cof.copy()))
    # Adjunta
    Adj = Cof.transpose()
    steps.append(("Matriz Adjunta (Transpuesta de la matriz de cofactores):", Adj.copy()))
    # Final
    inv = M.inv()
    steps.append((f"Dividimos la Adjunta entre el determinante det = {sp.latex(det_val)} para obtener la inversa:", inv.copy()))
    return steps
