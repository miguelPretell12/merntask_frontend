import React from 'react'
import { Link } from 'react-router-dom'
import useProyectos from '../hooks/useProyectos'
import useAuth from '../hooks/useAuth'
import Busqueda from './Busqueda'

const Header = () => {
    const {handleBuscador, cerrarSessionProyectos} = useProyectos()
    const {cerrarSessionAuth} = useAuth()

    const handleCerrarSesion = () => {
        cerrarSessionAuth()
        cerrarSessionProyectos()
        localStorage.removeItem('token')
    }

    return (
    <header className='px-4 py-5 bg-white border-b'>
        <div className='md:flex md:justify-between'>
            <h2 className='text-4xl text-sky-600 font-black text-center mb-5 md:mb-0'>UpTask</h2>

            {/* <input 
                type='search'
                placeholder='Buscar Proyecto'
                className='rounded-lg lg:w-96 p-2 border'
            /> */}
            <div className='flex items-center gap-4'>
                <button type='button' className='font-bold uppercase'
                onClick={handleBuscador}
                >Buscar Proyecto</button>
                <Link to="/proyectos"
                    className="font-bold uppercase"
                >Proyectos</Link>
                <button type='button' className='text-white text-sm bg-sky-600 p-3 rounded-md uppercase font-bold'
                    onClick={handleCerrarSesion}
                >Cerrar Sesión</button>
            </div>
        </div>
        <Busqueda />
    </header>
  )
}

export default Header