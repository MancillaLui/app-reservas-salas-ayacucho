import {PanelLayout,Protegido} from '../../presentacion/compartido/navegacion';
export default function Layout({children}:{children:React.ReactNode}){return <Protegido rol="ADMIN"><PanelLayout admin>{children}</PanelLayout></Protegido>;}
