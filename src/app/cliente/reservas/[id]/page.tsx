import {DetalleReserva} from '../../../../presentacion/reservas/lista';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <DetalleReserva id={id}/>;}
