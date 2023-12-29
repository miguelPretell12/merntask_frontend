import { useState, useEffect, createContext } from "react";
import clienteAxios from "../../config/clienteAxios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import io from "socket.io-client";
let socket
const ProyectosContext = createContext();

const ProyectosProvider = ({children}) => {
    const [proyectos, setProyectos] = useState([])
    const [alerta, setAlerta] = useState({})
    const [proyecto, setProyecto] = useState({})
    const [cargando, setCargando] = useState(false)
    const [modalFormularioTarea, setModalFormularioTarea] = useState(false)
    const [modalEliminarTarea, setModalEliminarTarea] = useState(false)
    const [colaborador, setColaborador] = useState({})
    const [modalEliminarColaborador, setModalEliminarColaborador] = useState(false)
    const [buscador, setBuscador] = useState(false)

    const [tarea, setTarea] = useState({})

    const navigate = useNavigate()
    const {auth} =useAuth()
    
    useEffect(()=> {
        const obtenerProyecto = async () => {
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios('/proyectos', config) 

            setProyectos(data)
        }

        obtenerProyecto()
    }, [auth])

    useEffect(()=>{
        socket = io(import.meta.env.VITE_BACKEND_URL)

    }, [])

    const mostrarAlerta = alerta => {
        setAlerta(alerta)

        setTimeout(() => {
            setAlerta({})
        }, 5000);
    }

    const submitProyecto = async proyecto => {
        if(proyecto.id) {
            await editarProyecto(proyecto)
        }else {
            await nuevoProyecto(proyecto)
        }

    }

    const editarProyecto = async proyecto => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }
   
            const {data} = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config)
            console.log(data)
            // Sincronizar el state
            const proyectoActualizados = proyectos.map(proyectoState => proyectoState._id === data._id? data: proyectoState)
            
            setProyectos(proyectoActualizados)
            // Mostrar la alerta
            setAlerta({
                msg:"Proyecto Actualizado Correctamente",
                error: false
            })

            // Redireccionar
            setTimeout(() => {
                setAlerta({})
                navigate('/proyectos')
            }, 3000);

        } catch (error) {
            
        }
    }

    const nuevoProyecto = async proyecto => {
        try {
            const token = localStorage.getItem('token')

            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const {data} = await clienteAxios.post("/proyectos", {
                cliente: proyecto.cliente,
                descripcion: proyecto.descripcion,
                fechaEntrega: proyecto.fechaEntrega,
                nombre: proyecto.nombre
            }, config)
            console.log(data)
            setProyectos([...proyectos, data])

            setAlerta({
                msg:"Proyecto Creado Correctamente",
                error: false
            })
            setTimeout(() => {
                setAlerta({})
                navigate('/proyectos')
            }, 3000);

        } catch (error) {}
    }

    const obtenerProyecto = async id => {
        setCargando(true)
        try {
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const {data} = await clienteAxios(`/proyectos/${id}`, config)
            setProyecto(data)
            setAlerta({})
        } catch (error) {
            navigate('/proyectos')
             setAlerta({ 
                 msg: error.response.data.msg,
                 error: true
             })

             setTimeout(()=> {
                setAlerta({})
             }, 3000)
        } finally {
            setCargando(false)
        }
    }

    const eliminarProyecto = async (id) => {
        const token = localStorage.getItem('token')
        if(!token) return
        const config = {
            headers: {
                "Content-Type":"application/json",
                Authorization: `Bearer ${token}`
            }
        }
        const {data} = await clienteAxios.delete(`/proyectos/${id}`, config)
        
        // Sincronizar el state
        const proyectoActualizados = proyectos.filter(proyectoState => 
            proyectoState._id !== id )

        setProyectos(proyectoActualizados)

        setAlerta({
            msg: data.msg,
            error: false
        })

        setTimeout(() => {
            setAlerta({})
            navigate('/proyectos')
        }, 3000);
    }

    const handleModalTarea = () =>{
        setModalFormularioTarea(!modalFormularioTarea)
        setTarea({})
    }

    const submitTarea = async (tarea) => {
        if(tarea?.id) {
            await editarTarea(tarea)
        }else {
            await crearTarea(tarea)
        }
        
    }

    const editarTarea = async (tarea) => {
        try {
            //delete tarea.id;
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config)

            // TODO: Actualizar el DOM
            
            setAlerta({})
            setModalFormularioTarea(false)

            // SOCKET IO
            socket.emit('actualizar tarea', data)
        } catch (error) {
            console.log(error)
        }   
    }

    const crearTarea = async tarea => {
        try {
            delete tarea.id;
            
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post('/tareas',tarea, config)

            // Agrega la tarea al state
            
            setAlerta({})
            setModalFormularioTarea(false)

            // SOCKET IO
            socket.emit('nueva tarea', data)

        } catch (error) {
            console.log(error)
        }
    }

    const handleModalEditarTarea = tarea => {
        setTarea(tarea)
        setModalFormularioTarea(true)
    }

    const handleModalEliminarTarea = tarea => {
        setTarea(tarea)
        setModalEliminarTarea(!modalEliminarTarea)
    }

    const eliminarTarea = async () => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.delete(`/tareas/${tarea._id}`, config)
            setAlerta({
                msg: data.msg,
                 error: false
            })

            // TODO: Actualizar el DOM
            
            setModalEliminarTarea(false)

            // Socket IO
            socket.emit("eliminar tarea", tarea)

            setTarea({})
            setTimeout(()=>{
                setAlerta({})
            },3000)
        } catch (error) {
            console.log(error)
        }
    }

    const submitColaborador = async (email) => {
        try {
            setCargando(true)
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post('/proyectos/colaboradores',{email}, config)

            setColaborador(data)
            setAlerta({})
        } catch (error) {
            setAlerta({
                msg:error.response.data.msg,
                error: true
            })
        } finally {
            setCargando(false)
        }
    }

    const agregarColaborador = async (email) => {
        try {
            setCargando(true)
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const {data} = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`,email, config)
            
            setTimeout(() => {
                setAlerta({
                    msg: data.msg,
                    error:false
                })
            }, 3000);
            setColaborador({})
        } catch (error) {
            
        } finally {
            setCargando(false)
        }
    }

    const handleModalEliminarColaborador = (colaborador) => {
        setModalEliminarColaborador(!modalEliminarColaborador)
        setColaborador(colaborador)
    }

    const eliminarColaborador = async () => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const {data} = await clienteAxios.post(`/proyectos/eliminar-colaboradores/${proyecto._id}`,{id:colaborador._id}, config)
            
            const proyectoActualizado = {...proyecto}
            
            proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter(colaboradorState  => colaboradorState._id !== colaborador._id)
            setProyecto(proyectoActualizado)
            setTimeout(() => {
                setAlerta({
                    msg: data.msg,
                    error:false
                })
            }, 3000);
            setColaborador({})
            setModalEliminarColaborador(false)
        } catch (error) {
            console.log(error)
        }
    }

    const completarTarea =async id => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post(`/tareas/estado/${id}`, {}, config)

            
            setTarea({})
            setAlerta({})

            // socket
            socket.emit("cambiar estado", data)

        } catch (error) {
            console.log(error)
        }
    }

    const handleBuscador = () => {
        setBuscador(!buscador)
    }

    // Socket io
    const submitTareasProyecto = (tarea) => {
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea]

        setProyecto(proyectoActualizado)
    }

    const eliminarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = proyectoActualizado.tareas.filter(tareaState => tareaState._id !== tarea._id)
            
        setProyecto(proyectoActualizado)
    }

    const actualizarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea: tareaState)
        setProyecto(proyectoActualizado)
    }

    const cambiarEstadoTarea = tarea => {
        const proyectoActualizado = {...proyecto}

        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState)

        setProyecto(proyectoActualizado)
    }

    const cerrarSessionProyectos = () => {
        setProyectos([])
        setProyecto({})
        setAlerta({})
    }

    return (
        <ProyectosContext.Provider
            value={{
                proyectos,
                mostrarAlerta,
                alerta,
                submitProyecto,
                obtenerProyecto,
                proyecto,
                cargando,
                eliminarProyecto,
                modalFormularioTarea,
                handleModalTarea,
                submitTarea,
                handleModalEditarTarea,
                tarea,
                modalEliminarTarea,
                handleModalEliminarTarea,
                eliminarTarea,
                submitColaborador,
                colaborador,
                agregarColaborador,
                handleModalEliminarColaborador,
                modalEliminarColaborador,
                eliminarColaborador,
                completarTarea,
                buscador,
                handleBuscador,
                submitTareasProyecto,
                eliminarTareaProyecto,
                actualizarTareaProyecto,
                cambiarEstadoTarea, 
                cerrarSessionProyectos
            }}
        >
            {children}
        </ProyectosContext.Provider>
    )
}

export { 
    ProyectosProvider
}

export default ProyectosContext