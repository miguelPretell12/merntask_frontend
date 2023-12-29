import { useState, useEffect, createContext } from 'react'
import clienteAxios from '../../config/clienteAxios'
import { useLocation, useNavigate } from 'react-router-dom'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({})
    const [cargando, setCargando] = useState(true)

    const navigate = useNavigate()
    const { pathname } = useLocation();
    useEffect(() => {
        const token = localStorage.getItem("token")
        const autenticarUsuario = async () => {
            
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            try {
                const { data } = await clienteAxios('/usuarios/perfil', config)

                setAuth(data)
                const rutas = ["/", "/registrar", "/olvide-password", "/confirmar"];
                if (rutas.includes(pathname)) {
                    navigate("/proyectos");
                }
                //navigate('/proyectos')
            } catch (error) {
                console.log(error);
                localStorage.removeItem("token");
                setAuth({});
            } finally {
                setCargando(false)
            }

            
        }
        if (token) {
            autenticarUsuario();
        } else {
            setCargando(false);
        }
        autenticarUsuario()
    }, [])

    const cerrarSessionAuth = () =>{ 
        setAuth({})
    }

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth,
                cargando,
                cerrarSessionAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export {
    AuthProvider
}

export default AuthContext
