import streamlit as st
import sympy as sp
import plotly.graph_objects as go
from tutor_componente import render_latex



# Bloque 1 : Vectores y Geometria Analitica

def mostrar_bloque1():
    st.markdown('<p class="page-title">Vectores y Geometria Analitica</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="page-subtitle">'
        "Este modulo cubre las operaciones fundamentales con vectores en el espacio "
        "tridimensional R3. Incluye el calculo de magnitudes (norma euclidiana), "
        "vectores unitarios, cosenos directores, y las dos operaciones binarias "
        "esenciales: el producto escalar (que produce un escalar y mide la proyeccion "
        "de un vector sobre otro) y el producto vectorial o cruz (que produce un "
        "vector perpendicular al plano de los operandos y cuya magnitud equivale al "
        "area del paralelogramo que estos definen). Ademas, se derivan las ecuaciones "
        "fundamentales de la geometria analitica del espacio: la ecuacion vectorial, "
        "parametrica y simetrica de la recta, y la ecuacion general del plano con explicaciones paso a paso."
        "</p>",
        unsafe_allow_html=True,
    )

    tab_vec, tab_geo, tab_lab = st.tabs(
        ["Operaciones Vectoriales", "Rectas y Planos", "Laboratorio 3D"]
    )

    # TAB  1: Vectores
    with tab_vec:
        st.markdown('<div class="section-label">Entrada de datos</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "Ingrese las componentes de dos vectores en R3. El sistema calculara "
            "de forma exacta, simbolica y paso a paso: la norma euclidiana de cada vector, "
            "el vector unitario, los cosenos directores, el producto escalar (punto), "
            "y el producto cruz (vectorial)."
            "</div>",
            unsafe_allow_html=True,
        )

        col_u, col_v = st.columns(2)
        with col_u:
            st.markdown("**Vector u**")
            ux = st.number_input("u_x", value=1, step=1, key="ux", help="Componente x del vector u")
            uy = st.number_input("u_y", value=2, step=1, key="uy", help="Componente y del vector u")
            uz = st.number_input("u_z", value=3, step=1, key="uz", help="Componente z del vector u")
        with col_v:
            st.markdown("**Vector v**")
            vx = st.number_input("v_x", value=4, step=1, key="vx", help="Componente x del vector v")
            vy = st.number_input("v_y", value=5, step=1, key="vy", help="Componente y del vector v")
            vz = st.number_input("v_z", value=6, step=1, key="vz", help="Componente z del vector v")

        u = sp.Matrix([sp.Integer(ux), sp.Integer(uy), sp.Integer(uz)])
        v = sp.Matrix([sp.Integer(vx), sp.Integer(vy), sp.Integer(vz)])

        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        st.markdown('<div class="section-label">Resultados con Procedimientos Paso a Paso</div>', unsafe_allow_html=True)

        # Magnitudes
        with st.container(border=True):
            st.markdown("### 1. Magnitudes (Normas)")
            st.markdown(
                "La norma euclidiana se define como la raiz cuadrada de la suma de los cuadrados de sus componentes: "
                r"$$||\vec{w}|| = \sqrt{w_x^2 + w_y^2 + w_z^2}$$"
            )

            # Desglose de u
            sum_sq_u = ux**2 + uy**2 + uz**2
            st.markdown("**Paso a paso para la norma de u:**")
            st.latex(
                r"||\vec{u}|| = \sqrt{(" + sp.latex(ux) + r")^2 + (" + sp.latex(uy) + r")^2 + (" + sp.latex(uz) + r")^2}"
            )
            st.latex(
                r"||\vec{u}|| = \sqrt{" + sp.latex(ux**2) + r" + " + sp.latex(uy**2) + r" + " + sp.latex(uz**2) + r"} = \sqrt{" + sp.latex(sum_sq_u) + r"}"
            )
            st.latex(r"||\vec{u}|| = " + sp.latex(u.norm()))

            # Desglose de v
            sum_sq_v = vx**2 + vy**2 + vz**2
            st.markdown("**Paso a paso para la norma de v:**")
            st.latex(
                r"||\vec{v}|| = \sqrt{(" + sp.latex(vx) + r")^2 + (" + sp.latex(vy) + r")^2 + (" + sp.latex(vz) + r")^2}"
            )
            st.latex(
                r"||\vec{v}|| = \sqrt{" + sp.latex(vx**2) + r" + " + sp.latex(vy**2) + r" + " + sp.latex(vz**2) + r"} = \sqrt{" + sp.latex(sum_sq_v) + r"}"
            )
            st.latex(r"||\vec{v}|| = " + sp.latex(v.norm()))

        # Producto Escalar
        with st.container(border=True):
            st.markdown("### 2. Producto Escalar (Punto)")
            st.markdown(
                "El producto punto de dos vectores se calcula sumando los productos de sus componentes correspondientes: "
                r"$$\vec{u} \cdot \vec{v} = u_x v_x + u_y v_y + u_z v_z$$"
            )
            dot = u.dot(v)
            st.markdown("**Paso a paso:**")
            st.latex(
                r"\vec{u} \cdot \vec{v} = (" + sp.latex(ux) + r")(" + sp.latex(vx) + r") + (" 
                + sp.latex(uy) + r")(" + sp.latex(vy) + r") + (" + sp.latex(uz) + r")(" + sp.latex(vz) + r")"
            )
            st.latex(
                r"\vec{u} \cdot \vec{v} = " + sp.latex(ux*vx) + r" + " + sp.latex(uy*vy) + r" + " + sp.latex(uz*vz) + r" = " + sp.latex(dot)
            )

            if dot == 0:
                st.markdown('<span class="badge-ok">Vectores ortogonales (ya que su producto punto es cero).</span>', unsafe_allow_html=True)
            else:
                cos_theta = dot / (u.norm() * v.norm())
                st.markdown("**Angulo entre los vectores ($\cos\theta$):**")
                st.latex(
                    r"\cos\theta = \frac{\vec{u} \cdot \vec{v}}{||\vec{u}|| ||\vec{v}||} = \frac{" 
                    + sp.latex(dot) + r"}{" + sp.latex(u.norm()) + r" \cdot " + sp.latex(v.norm()) + r"}"
                )
                st.latex(r"\cos\theta = " + sp.latex(sp.simplify(cos_theta)))

        # Producto Cruz
        with st.container(border=True):
            st.markdown("### 3. Producto Cruz (Vectorial)")
            st.markdown(
                "El producto vectorial genera un vector perpendicular al plano formado por u y v, usando la regla de determinantes: "
                r"$$\vec{u} \times \vec{v} = \det \begin{pmatrix} \vec{i} & \vec{j} & \vec{k} \\ u_x & u_y & u_z \\ v_x & v_y & v_z \end{pmatrix}$$"
            )
            cross = u.cross(v)
            st.markdown("**Paso a paso de la expansion por cofactores:**")
            st.latex(
                r"\vec{u} \times \vec{v} = \det \begin{pmatrix} \vec{i} & \vec{j} & \vec{k} \\ " 
                + sp.latex(ux) + r" & " + sp.latex(uy) + r" & " + sp.latex(uz) + r" \\ "
                + sp.latex(vx) + r" & " + sp.latex(vy) + r" & " + sp.latex(vz) + r" \end{pmatrix}"
            )
            st.latex(
                r"\vec{u} \times \vec{v} = \vec{i} \det \begin{pmatrix} " + sp.latex(uy) + r" & " + sp.latex(uz) + r" \\ " + sp.latex(vy) + r" & " + sp.latex(vz) + r" \end{pmatrix} "
                r"- \vec{j} \det \begin{pmatrix} " + sp.latex(ux) + r" & " + sp.latex(uz) + r" \\ " + sp.latex(vx) + r" & " + sp.latex(vz) + r" \end{pmatrix} "
                r"+ \vec{k} \det \begin{pmatrix} " + sp.latex(ux) + r" & " + sp.latex(uy) + r" \\ " + sp.latex(vx) + r" & " + sp.latex(vy) + r" \end{pmatrix}"
            )
            st.latex(
                r"\vec{u} \times \vec{v} = \vec{i} \left[ (" + sp.latex(uy) + r")(" + sp.latex(vz) + r") - (" + sp.latex(uz) + r")(" + sp.latex(vy) + r") \right] "
                r"- \vec{j} \left[ (" + sp.latex(ux) + r")(" + sp.latex(vz) + r") - (" + sp.latex(uz) + r")(" + sp.latex(vx) + r") \right] "
                r"+ \vec{k} \left[ (" + sp.latex(ux) + r")(" + sp.latex(vy) + r") - (" + sp.latex(uy) + r")(" + sp.latex(vx) + r") \right]"
            )
            st.latex(
                r"\vec{u} \times \vec{v} = \vec{i} \left[" + sp.latex(uy*vz) + r" - " + sp.latex(uz*vy) + r"\right] "
                r"- \vec{j} \left[" + sp.latex(ux*vz) + r" - " + sp.latex(uz*vx) + r"\right] "
                r"+ \vec{k} \left[" + sp.latex(ux*vy) + r" - " + sp.latex(uy*vx) + r"\right]"
            )
            st.latex(
                r"\vec{u} \times \vec{v} = (" + sp.latex(cross[0]) + r")\vec{i} + (" + sp.latex(cross[1]) + r")\vec{j} + (" + sp.latex(cross[2]) + r")\vec{k} = " + sp.latex(cross)
            )

            st.markdown("**Area del paralelogramo (Norma del producto cruz):**")
            st.latex(
                r"\text{Area} = ||\vec{u} \times \vec{v}|| = \sqrt{(" + sp.latex(cross[0]) + r")^2 + (" + sp.latex(cross[1]) + r")^2 + (" + sp.latex(cross[2]) + r")^2}"
            )
            st.latex(
                r"\text{Area} = \sqrt{" + sp.latex(cross[0]**2) + r" + " + sp.latex(cross[1]**2) + r" + " + sp.latex(cross[2]**2) + r"} = \sqrt{" + sp.latex(cross[0]**2 + cross[1]**2 + cross[2]**2) + r"}"
            )
            st.latex(r"\text{Area} = " + sp.latex(cross.norm()))

        # Vector unitario y cosenos directores
        st.markdown('<hr class="sep">', unsafe_allow_html=True)
        with st.expander("Ver Vector unitario y cosenos directores de u paso a paso"):
            st.markdown(
                "El vector unitario es el vector que apunta en la misma direccion "
                "que el original pero con magnitud 1. Se obtiene dividiendo cada "
                "componente entre la norma. Los cosenos directores son los cosenos "
                "de los angulos que el vector forma con los ejes X, Y y Z."
            )
            norm_u = u.norm()
            if norm_u == 0:
                st.markdown('<span class="badge-err">El vector u es el vector nulo (0,0,0). No tiene un vector unitario ni cosenos directores definidos (division entre cero).</span>', unsafe_allow_html=True)
            else:
                u_hat = u / norm_u
                st.markdown("**Paso a paso para el Vector Unitario:**")
                st.latex(
                    r"\hat{u} = \frac{1}{||\vec{u}||} \vec{u} = \frac{1}{" + sp.latex(norm_u) + r"} \begin{pmatrix} " 
                    + sp.latex(ux) + r" \\ " + sp.latex(uy) + r" \\ " + sp.latex(uz) + r" \end{pmatrix}"
                )
                st.latex(r"\hat{u} = " + sp.latex(sp.simplify(u_hat)))

                st.markdown("**Paso a paso para los Cosenos Directores:**")
                st.latex(
                    r"\cos\alpha = \frac{u_x}{||\vec{u}||} = \frac{" + sp.latex(ux) + r"}{" + sp.latex(norm_u) + r"} = " + sp.latex(sp.simplify(ux / norm_u))
                )
                st.latex(
                    r"\cos\beta = \frac{u_y}{||\vec{u}||} = \frac{" + sp.latex(uy) + r"}{" + sp.latex(norm_u) + r"} = " + sp.latex(sp.simplify(uy / norm_u))
                )
                st.latex(
                    r"\cos\gamma = \frac{u_z}{||\vec{u}||} = \frac{" + sp.latex(uz) + r"}{" + sp.latex(norm_u) + r"} = " + sp.latex(sp.simplify(uz / norm_u))
                )

    # TAB  2: Rectas y Planos
    with tab_geo:
        st.markdown('<div class="section-label">Geometria analitica del espacio</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "En la geometria analitica del espacio tridimensional, una recta queda "
            "completamente determinada al conocer un punto por el que pasa (P0) y un "
            "vector que indica su direccion (vector director d). De manera analoga, un plano "
            "queda determinado por un punto contenido en el (P0) y un vector "
            "perpendicular a su superficie (vector normal n)."
            "</div>",
            unsafe_allow_html=True,
        )

        col_p, col_d = st.columns(2)
        with col_p:
            st.markdown("**Punto P0**")
            px = st.number_input("P_x", value=1, step=1, key="px", help="Coordenada x del punto base")
            py_ = st.number_input("P_y", value=-1, step=1, key="py", help="Coordenada y del punto base")
            pz = st.number_input("P_z", value=2, step=1, key="pz", help="Coordenada z del punto base")
        with col_d:
            st.markdown("**Vector director / normal**")
            dx = st.number_input("d_x", value=3, step=1, key="dx", help="Componente x del vector director o normal")
            dy = st.number_input("d_y", value=1, step=1, key="dy", help="Componente y del vector director o normal")
            dz = st.number_input("d_z", value=-2, step=1, key="dz", help="Componente z del vector director o normal")

        P0 = sp.Matrix([sp.Integer(px), sp.Integer(py_), sp.Integer(pz)])
        D = sp.Matrix([sp.Integer(dx), sp.Integer(dy), sp.Integer(dz)])
        t = sp.Symbol("t")
        x, y, z = sp.symbols("x y z")

        st.markdown('<hr class="sep">', unsafe_allow_html=True)

        st.markdown("### Ecuacion vectorial de la recta paso a paso")
        st.markdown("Se construye sumando el punto fijo mas el parametro escalar $t$ multiplicado por el vector director:")
        recta = P0 + t * D
        st.latex(
            r"\vec{r}(t) = \vec{P}_0 + t \vec{d}"
        )
        st.latex(
            r"\vec{r}(t) = \begin{pmatrix} " + sp.latex(px) + r" \\ " + sp.latex(py_) + r" \\ " + sp.latex(pz) + r" \end{pmatrix} + t \begin{pmatrix} " 
            + sp.latex(dx) + r" \\ " + sp.latex(dy) + r" \\ " + sp.latex(dz) + r" \end{pmatrix}"
        )
        st.latex(
            r"\vec{r}(t) = \begin{pmatrix} " + sp.latex(recta[0]) + r" \\ " + sp.latex(recta[1]) + r" \\ " + sp.latex(recta[2]) + r" \end{pmatrix}"
        )

        st.markdown("### Ecuaciones parametricas")
        st.markdown("Se separa la ecuacion vectorial componente a componente, expresando cada variable en funcion de $t$:")
        st.latex(
            f"x = P_x + d_x t \\implies x = {sp.latex(px)} + {sp.latex(dx)}t"
        )
        st.latex(
            f"y = P_y + d_y t \\implies y = {sp.latex(py_)} + {sp.latex(dy)}t"
        )
        st.latex(
            f"z = P_z + d_z t \\implies z = {sp.latex(pz)} + {sp.latex(dz)}t"
        )

        st.markdown("### Ecuacion general del plano paso a paso")
        st.markdown(
            "Usando el vector ingresado como normal $\vec{n}$, se impone la condicion de ortogonalidad: "
            r"$\vec{n} \cdot (\vec{x} - \vec{P}_0) = 0$"
        )
        plano = D.dot(sp.Matrix([x, y, z]) - P0)
        plano_expandido = sp.expand(plano)

        st.latex(
            r"\begin{pmatrix} " + sp.latex(dx) + r" \\ " + sp.latex(dy) + r" \\ " + sp.latex(dz) + r" \end{pmatrix} \cdot \left[ \begin{pmatrix} x \\ y \\ z \end{pmatrix} - \begin{pmatrix} " 
            + sp.latex(px) + r" \\ " + sp.latex(py_) + r" \\ " + sp.latex(pz) + r" \end{pmatrix} \right] = 0"
        )
        st.latex(
            f"{sp.latex(dx)}(x - {sp.latex(px)}) + {sp.latex(dy)}(y - ({sp.latex(py_)})) + {sp.latex(dz)}(z - {sp.latex(pz)}) = 0"
        )
        st.latex(
            f"{sp.latex(dx*x)} - {sp.latex(dx*px)} + {sp.latex(dy*y)} - {sp.latex(dy*py_)} + {sp.latex(dz*z)} - {sp.latex(dz*pz)} = 0"
        )
        st.latex(sp.latex(plano_expandido) + " = 0")

    # TAB  3: Lab 3D
    with tab_lab:
        st.markdown('<div class="section-label">Visualizacion interactiva</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="card">'
            "Representacion tridimensional de los vectores u (en azul) y v (en rojo) "
            "ingresados en la primera pestana, junto con su producto cruz (en verde, "
            "linea punteada)."
            "</div>",
            unsafe_allow_html=True,
        )

        u_f = [float(ux), float(uy), float(uz)]
        v_f = [float(vx), float(vy), float(vz)]

        fig = go.Figure()

        lim = max(max(abs(c) for c in u_f), max(abs(c) for c in v_f)) * 1.3
        for axis_vec, name, color in [
            ([lim, 0, 0], "X", "#dee2e6"),
            ([0, lim, 0], "Y", "#dee2e6"),
            ([0, 0, lim], "Z", "#dee2e6"),
        ]:
            fig.add_trace(
                go.Scatter3d(
                    x=[0, axis_vec[0]], y=[0, axis_vec[1]], z=[0, axis_vec[2]],
                    mode="lines", line=dict(color=color, width=2, dash="dot"),
                    name=name, showlegend=False,
                )
            )

        fig.add_trace(
            go.Scatter3d(
                x=[0, u_f[0]], y=[0, u_f[1]], z=[0, u_f[2]],
                mode="lines+markers",
                line=dict(color="#4361ee", width=6),
                marker=dict(size=[3, 6], color="#4361ee"),
                name="Vector u",
            )
        )
        fig.add_trace(
            go.Scatter3d(
                x=[0, v_f[0]], y=[0, v_f[1]], z=[0, v_f[2]],
                mode="lines+markers",
                line=dict(color="#e63946", width=6),
                marker=dict(size=[3, 6], color="#e63946"),
                name="Vector v",
            )
        )
        cross_f = [float(u.cross(v)[i].evalf()) for i in range(3)]
        fig.add_trace(
            go.Scatter3d(
                x=[0, cross_f[0]], y=[0, cross_f[1]], z=[0, cross_f[2]],
                mode="lines+markers",
                line=dict(color="#2a9d8f", width=4, dash="dash"),
                marker=dict(size=[3, 5], color="#2a9d8f"),
                name="u x v",
            )
        )

        fig.update_layout(
            scene=dict(
                xaxis=dict(backgroundcolor="white", gridcolor="#e9ecef", title="X"),
                yaxis=dict(backgroundcolor="white", gridcolor="#e9ecef", title="Y"),
                zaxis=dict(backgroundcolor="white", gridcolor="#e9ecef", title="Z"),
                aspectmode="cube",
            ),
            margin=dict(l=0, r=0, t=0, b=0),
            paper_bgcolor="white",
            height=550,
        )
        st.plotly_chart(fig, use_container_width=False, width="stretch")
