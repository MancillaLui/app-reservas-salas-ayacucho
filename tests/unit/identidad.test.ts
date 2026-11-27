import { SupabaseIdentidad } from '../../src/modulos/usuarios/infraestructura/supabase-identidad';
import type { Database } from '../../src/shared/database';
const mockGetUser=jest.fn();
jest.mock('@supabase/supabase-js',()=>({createClient:()=>({auth:{getUser:mockGetUser}})}));
beforeEach(()=>{process.env.NEXT_PUBLIC_SUPABASE_URL='https://ejemplo.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='public-key';mockGetUser.mockReset();});
test('ignora rol de user_metadata y consulta rol controlado por el servidor',async()=>{mockGetUser.mockResolvedValue({data:{user:{id:'u',email:'user@example.com',user_metadata:{rol:'ADMIN'}}},error:null});const query=jest.fn().mockResolvedValueOnce({rows:[]}).mockResolvedValueOnce({rows:[{rol:'CLIENTE'}]});const identity=new SupabaseIdentidad({query} as unknown as Database);expect((await identity.autenticar('firmado')).role).toBe('CLIENTE');expect(mockGetUser).toHaveBeenCalledWith('firmado');expect(query).toHaveBeenCalledWith('SELECT rol FROM perfiles WHERE id=$1',['u']);});
test('un token rechazado por Supabase no accede a los perfiles',async()=>{mockGetUser.mockResolvedValue({data:{user:null},error:{message:'invalid'}});const query=jest.fn();await expect(new SupabaseIdentidad({query} as unknown as Database).autenticar('falso')).rejects.toMatchObject({status:401});expect(query).not.toHaveBeenCalled();});
