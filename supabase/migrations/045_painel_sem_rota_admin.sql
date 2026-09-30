-- 045 — a página do painel não conta visita (Isaias, 30/09/2026: "a page admin
-- é administrativa, é nosso... não faz sentido contar").
-- O site já não manda nada da rota do painel (painelColeta.js, `desligado`),
-- mas sobraram no banco as visitas de antes: `/admin` era a tela antiga de
-- auditoria de compartilhamentos (contava como página comum) e
-- `/central-if-7k2q` foi o endereço do painel até a v10.313.3.
-- Rodar inteiro no SQL Editor do Supabase. Pode rodar de novo sem erro.

-- 1. Nunca mais grava nada dessas rotas, venha de onde vier (celular com a
--    versão velha do site em cache, por exemplo).
create or replace function public.painel_ignorar_rota_admin()
returns trigger language plpgsql as $$
begin
  if new.rota like '/admin%' or new.rota like '/central-if-7k2q%' then
    return null; -- descarta a linha
  end if;
  return new;
end $$;

drop trigger if exists painel_ignorar_rota_admin on public.painel_eventos;
create trigger painel_ignorar_rota_admin
  before insert on public.painel_eventos
  for each row execute function public.painel_ignorar_rota_admin();

-- 2. Apaga o que já foi contado dessas rotas.
delete from public.painel_eventos
where rota like '/admin%' or rota like '/central-if-7k2q%';
