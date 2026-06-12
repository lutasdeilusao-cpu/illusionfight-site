-- 019_dix_initial_1000.sql
-- Todo usuário começa com 1000 DIX ao criar conta.
-- Esta migration garante que contas existentes com saldo zerado
-- ou sem registro em dix_wallet também recebam os 1000 DIX iniciais.

-- 1. Atualiza contas que têm dix_wallet mas saldo = 0
UPDATE dix_wallet
SET saldo = 1000, updated_at = now()
WHERE saldo = 0 OR saldo IS NULL;

-- 2. Insere registro para usuários que têm profile mas não têm dix_wallet
INSERT INTO dix_wallet (user_id, saldo, updated_at)
SELECT p.id, 1000, now()
FROM profiles p
LEFT JOIN dix_wallet dw ON dw.user_id = p.id
WHERE dw.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Registra no histórico (apenas para inserts/updates que não sejam de usuários já com saldo > 0)
INSERT INTO dix_historico (user_id, valor, motivo, created_at)
SELECT dw.user_id, 1000, 'boas-vindas', now()
FROM dix_wallet dw
WHERE dw.saldo = 1000
  AND dw.updated_at = now()
  AND NOT EXISTS (
    SELECT 1 FROM dix_historico dh
    WHERE dh.user_id = dw.user_id AND dh.motivo = 'boas-vindas'
  );
