import type { Metadata } from 'next';
import '../cliente/estilos/tema.css';
import '../cliente/estilos/interfaz.css';
import {SesionProvider} from '../cliente/presentacion/compartido/sesion';
export const metadata:Metadata={title:'Ensaya | Salas de ensayo en Ayacucho',description:'Reserva tu sala, elige tus equipos y organiza tu próximo ensayo en Ayacucho.'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body><SesionProvider>{children}</SesionProvider></body></html>; }
