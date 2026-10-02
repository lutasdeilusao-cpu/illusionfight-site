-- 049 — Robô não conta visita, também no BANCO (02/10/2026). O renderizador
-- do Google finge ser um Nexus 5X com Android 6.0.1 (Build/MMB29P) e passou
-- 6x pelo filtro do navegador entre 30/09 e 02/10. O site novo já não manda
-- (painelColeta.js, APARELHO_DE_ROBO), mas celular com a versão velha em
-- cache ainda manda — a trava aqui pega tudo. Rodar inteiro no SQL Editor;
-- pode rodar de novo sem erro.

-- 1. Uma trava só pra tudo que não conta (rota do painel + robô).
create or replace function public.painel_ignorar_rota_admin()
returns trigger language plpgsql as $$
begin
  if new.rota like '/admin%' or new.rota like '/central-if-7k2q%' then
    return null; -- descarta a linha
  end if;
  if coalesce(new.modelo, '') like 'Nexus 5X Build/MMB29P%' then
    return null; -- renderizador do Google
  end if;
  return new;
end $$;

-- 2. Apaga as visitas de robô que já entraram.
delete from public.painel_eventos where modelo like 'Nexus 5X Build/MMB29P%';
