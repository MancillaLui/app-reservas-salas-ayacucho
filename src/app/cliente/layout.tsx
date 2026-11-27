import {PanelLayout,Protegido} from '../../cliente/presentacion/compartido/navegacion';
export default function Layout({children}:{children:React.ReactNode}){return <Protegido rol="CLIENTE"><PanelLayout>{children}</PanelLayout></Protegido>;}
