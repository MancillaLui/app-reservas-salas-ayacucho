import {PanelLayout,Protegido} from '../../cliente/presentacion/compartido/navegacion';
export default function Layout({children}:{children:React.ReactNode}){return <Protegido rol="ADMIN"><PanelLayout admin>{children}</PanelLayout></Protegido>;}
