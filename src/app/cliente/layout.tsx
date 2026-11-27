import {PanelLayout,Protegido} from '../../presentacion/compartido/navegacion';
export default function Layout({children}:{children:React.ReactNode}){return <Protegido rol="CLIENTE"><PanelLayout>{children}</PanelLayout></Protegido>;}
