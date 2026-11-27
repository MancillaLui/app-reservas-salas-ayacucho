import type { Metadata } from 'next';
import './tema.css';
import {SesionProvider} from '../presentacion/compartido/sesion';
export const metadata:Metadata={title:'Ensaya | Salas de ensayo en Ayacucho',description:'Reserva tu sala, elige tus equipos y organiza tu próximo ensayo en Ayacucho.'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body><SesionProvider>{children}</SesionProvider></body></html>; }
