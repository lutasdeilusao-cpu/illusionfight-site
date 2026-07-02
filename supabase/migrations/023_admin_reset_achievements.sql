-- Migration 023: Admin Reset Achievements — RLS policies for DELETE
-- As tabelas user_achievements e perfil_eventos têm policies só para SELECT/INSERT.
-- Sem policy de DELETE, o Supabase bloqueia o reset mesmo sendo o próprio usuário.

-- Permite que o usuário delete suas próprias conquistas desbloqueadas
CREATE POLICY "usuario deleta proprias conquistas"
  ON public.user_achievements FOR DELETE
  USING (auth.uid() = user_id);

-- Permite que o usuário delete seus próprios eventos do tipo conquista
CREATE POLICY "usuario deleta proprios eventos de conquista"
  ON public.perfil_eventos FOR DELETE
  USING (auth.uid() = user_id AND tipo = 'conquista');
