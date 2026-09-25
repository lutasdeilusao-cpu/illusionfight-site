-- Migration 042: WEB SHARD — reações anônimas por capítulo
-- Feedback leve no fim de cada capítulo: lixo / aceitável / gostei muito /
-- parabéns, vou compartilhar. Qualquer visitante reage, com ou sem conta.
-- O visitante é identificado só por um hash SHA-256 (64 hex) gerado no
-- navegador a partir de um id aleatório — nenhum dado pessoal, nenhum user_id.
-- Uma reação por visitante por capítulo; reagir de novo troca a anterior.
--
-- A tabela NÃO tem policy: ninguém lê nem escreve direto. Todo acesso passa
-- pelas duas funções SECURITY DEFINER abaixo, que validam a entrada.

CREATE TABLE IF NOT EXISTS webshard_reacoes (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  capitulo TEXT NOT NULL,
  visitante TEXT NOT NULL,
  reacao TEXT NOT NULL CHECK (reacao IN ('lixo', 'aceitavel', 'gostei', 'parabens')),
  idioma TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (titulo, capitulo, visitante)
);

CREATE INDEX IF NOT EXISTS webshard_reacoes_capitulo_idx
  ON webshard_reacoes (titulo, capitulo);

ALTER TABLE webshard_reacoes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION webshard_reagir(
  p_titulo TEXT,
  p_capitulo TEXT,
  p_visitante TEXT,
  p_reacao TEXT,
  p_idioma TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_titulo !~ '^[a-z0-9-]{1,60}$' OR p_capitulo !~ '^[a-z0-9-]{1,20}$' THEN
    RAISE EXCEPTION 'webshard_reagir: titulo/capitulo invalido';
  END IF;
  IF p_visitante !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'webshard_reagir: visitante invalido';
  END IF;
  IF p_reacao NOT IN ('lixo', 'aceitavel', 'gostei', 'parabens') THEN
    RAISE EXCEPTION 'webshard_reagir: reacao invalida';
  END IF;

  INSERT INTO webshard_reacoes (titulo, capitulo, visitante, reacao, idioma)
  VALUES (p_titulo, p_capitulo, p_visitante, p_reacao, left(p_idioma, 5))
  ON CONFLICT (titulo, capitulo, visitante)
  DO UPDATE SET reacao = EXCLUDED.reacao,
                idioma = EXCLUDED.idioma,
                atualizado_em = now();
END;
$$;

CREATE OR REPLACE FUNCTION webshard_contagem(p_titulo TEXT, p_capitulo TEXT)
RETURNS TABLE (reacao TEXT, total BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.reacao, count(*)::BIGINT
  FROM webshard_reacoes r
  WHERE r.titulo = p_titulo AND r.capitulo = p_capitulo
  GROUP BY r.reacao;
$$;

REVOKE ALL ON FUNCTION webshard_reagir(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION webshard_contagem(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION webshard_reagir(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION webshard_contagem(TEXT, TEXT) TO anon, authenticated;
