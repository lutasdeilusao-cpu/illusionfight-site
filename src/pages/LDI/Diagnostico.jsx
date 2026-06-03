import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import './LDI.css'

const ADMIN_EMAIL = 'isaiasgamedev@gmail.com'
const LDI_VERSION = '1.0.3'

const STEP_LABELS = {
  supabase: 'Conexão Supabase',
  schema_cs: 'Schema — character_sheets',
  schema_gs: 'Schema — game_saves',
  rls: 'RLS — CRUD usuário logado',
  fluxo: 'Fluxo completo save/load',
  aux: 'Tabelas auxiliares',
}

function Step({ label, status, detail, sql }) {
  const icon = status === 'ok' ? '🟢' : status === 'fail' ? '🔴' : status === 'running' ? '⏳' : '⚪'
  return (
    <div className="ldi-diagnostico-step">
      <div className="ldi-diagnostico-line">
        <span className="ldi-diagnostico-icon">{icon}</span>
        <span className="ldi-diagnostico-label">{label}</span>
        {status !== 'idle' && (
          <span className={`ldi-diagnostico-status ldi-diagnostico-status--${status}`}>
            {status === 'ok' ? 'OK' : status === 'fail' ? 'FALHOU' : 'RODANDO'}
          </span>
        )}
      </div>
      {detail && <div className="ldi-diagnostico-detail">{detail}</div>}
      {sql && <pre className="ldi-diagnostico-sql">{sql}</pre>}
    </div>
  )
}

export default function Diagnostico() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [results, setResults] = useState({})
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState([])

  const updateResult = useCallback((key, status, detail, sql) => {
    setResults(r => ({ ...r, [key]: { status, detail, sql } }))
    setOutput(o => [...o, `[${status.toUpperCase()}] ${STEP_LABELS[key] || key}${detail ? ': ' + detail : ''}`])
  }, [])

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const runTests = useCallback(async () => {
    setRunning(true)
    setResults({})
    setOutput([])
    let testId = null
    let testSheetId = null

    // 1. Supabase connection
    updateResult('supabase', 'running')
    await sleep(200)
    try {
      const { error } = await supabase.from('character_sheets').select('id').limit(1)
      if (error) throw error
      updateResult('supabase', 'ok', 'Supabase client conectado. SELECT 1 OK.')
    } catch (err) {
      updateResult('supabase', 'fail', `Falha na conexão: ${err.message}`)
    }
    await sleep(150)

    // 2. Schema — character_sheets
    updateResult('schema_cs', 'running')
    await sleep(200)
    try {
      const { data: cols, error } = await supabase
        .rpc('get_schema_info', { table_name: 'character_sheets' })
      if (error || !cols) {
        // fallback: query information_schema directly
        const { data: fallback, error: fbErr } = await supabase
          .from('information_schema.columns')
          .select('column_name, column_default, is_nullable')
          .eq('table_name', 'character_sheets')
          .eq('table_schema', 'public')
        if (fbErr) throw fbErr
        const colNames = (fallback || []).map(c => c.column_name)
        const checks = {
          existe: true,
          id: colNames.includes('id'),
          user_id: colNames.includes('user_id'),
          updated_at: colNames.includes('updated_at'),
          created_at: colNames.includes('created_at'),
        }
        const idCol = (fallback || []).find(c => c.column_name === 'id')
        const idDefault = idCol?.column_default
        if (idDefault && idDefault.includes('gen_random_uuid')) checks.id_default = true
        const failed = Object.entries(checks).filter(([k, v]) => !v && k !== 'existe')
        if (failed.length === 0) {
          updateResult('schema_cs', 'ok', 'Todas as colunas obrigatórias presentes.')
        } else {
          const missing = failed.map(([k]) => k).join(', ')
          const sqlHint = missing.includes('updated_at')
            ? 'ALTER TABLE character_sheets ADD COLUMN updated_at timestamptz DEFAULT now();'
            : ''
          updateResult('schema_cs', 'fail', `Colunas ausentes: ${missing}`, sqlHint)
        }
      } else {
        updateResult('schema_cs', 'ok', 'Todas as colunas verificadas via RPC.')
      }
    } catch (err) {
      updateResult('schema_cs', 'fail', `Erro ao verificar schema: ${err.message}`)
    }
    await sleep(150)

    // 3. Schema — game_saves
    updateResult('schema_gs', 'running')
    await sleep(200)
    try {
      const { data: fallback, error: fbErr } = await supabase
        .from('information_schema.columns')
        .select('column_name, column_default, is_nullable')
        .eq('table_name', 'game_saves')
        .eq('table_schema', 'public')
      if (fbErr) throw fbErr
      const colNames = (fallback || []).map(c => c.column_name)
      const checks = {
        existe: true,
        id: colNames.includes('id'),
        sheet_id: colNames.includes('sheet_id'),
        updated_at: colNames.includes('updated_at'),
        created_at: colNames.includes('created_at'),
      }
      const idCol = (fallback || []).find(c => c.column_name === 'id')
      if (idCol?.column_default?.includes('gen_random_uuid')) checks.id_default = true
      const failed = Object.entries(checks).filter(([k, v]) => !v && k !== 'existe')
      if (failed.length === 0) {
        updateResult('schema_gs', 'ok', 'Todas as colunas obrigatórias presentes.')
      } else {
        const missing = failed.map(([k]) => k).join(', ')
        const sqlHint = missing.includes('updated_at')
          ? 'ALTER TABLE game_saves ADD COLUMN updated_at timestamptz DEFAULT now();'
          : ''
        updateResult('schema_gs', 'fail', `Colunas ausentes: ${missing}`, sqlHint)
      }
    } catch (err) {
      updateResult('schema_gs', 'fail', `Erro ao verificar schema: ${err.message}`)
    }
    await sleep(150)

    // 4. RLS — CRUD tests (only if logged in)
    updateResult('rls', 'running')
    await sleep(200)
    if (!user) {
      updateResult('rls', 'fail', 'Usuário não logado — não é possível testar RLS.')
    } else {
      try {
        // INSERT
        testId = crypto.randomUUID()
        const { error: insErr } = await supabase.from('character_sheets').insert({
          id: testId,
          user_id: user.id,
          sheet_name: '__diagnostico_test__',
          attributes: { F: 1, H: 1, R: 1, A: 1, PdF: 1 },
          weapon: 'test',
          elemental: 'test',
        })
        if (insErr) throw new Error(`INSERT: ${insErr.message}`)

        // SELECT
        const { data: selData, error: selErr } = await supabase
          .from('character_sheets')
          .select('id')
          .eq('id', testId)
          .single()
        if (selErr) throw new Error(`SELECT: ${selErr.message}`)
        if (!selData) throw new Error('SELECT: registro não encontrado')

        // UPDATE
        const { error: updErr } = await supabase
          .from('character_sheets')
          .update({ sheet_name: '__diagnostico_test_updated__' })
          .eq('id', testId)
        if (updErr) throw new Error(`UPDATE: ${updErr.message}`)

        // DELETE
        const { error: delErr } = await supabase
          .from('character_sheets')
          .delete()
          .eq('id', testId)
        if (delErr) throw new Error(`DELETE: ${delErr.message}`)

        testId = null
        updateResult('rls', 'ok', 'INSERT → SELECT → UPDATE → DELETE OK.')
      } catch (err) {
        if (testId) {
          await supabase.from('character_sheets').delete().eq('id', testId).maybeSingle()
          testId = null
        }
        updateResult('rls', 'fail', err.message)
      }
    }
    await sleep(150)

    // 5. Fluxo completo save/load
    updateResult('fluxo', 'running')
    await sleep(200)
    if (!user) {
      updateResult('fluxo', 'fail', 'Usuário não logado.')
    } else {
      try {
        // Criar ficha com UUID gerado no cliente
        testSheetId = crypto.randomUUID()
        const { error: csErr } = await supabase.from('character_sheets').insert({
          id: testSheetId,
          user_id: user.id,
          sheet_name: '__diagnostico_fluxo__',
          attributes: { F: 2, H: 2, R: 2, A: 2, PdF: 2 },
          weapon: 'katana',
          elemental: 'fogo',
        })
        if (csErr) throw new Error(`Criar ficha: ${csErr.message}`)

        // Criar game_save linkado
        const { error: gsErr } = await supabase.from('game_saves').insert({
          user_id: user.id,
          sheet_id: testSheetId,
          pv_current: 10,
          pm_current: 8,
        })
        if (gsErr) throw new Error(`Criar save: ${gsErr.message}`)

        // Carregar fichas do usuário
        const { data: sheets, error: loadErr } = await supabase
          .from('character_sheets')
          .select('id')
          .eq('user_id', user.id)
        if (loadErr) throw new Error(`Carregar fichas: ${loadErr.message}`)
        const found = (sheets || []).some(s => s.id === testSheetId)
        if (!found) throw new Error('Ficha criada não encontrada no SELECT do usuário')

        // Cleanup
        await supabase.from('game_saves').delete().eq('sheet_id', testSheetId)
        await supabase.from('character_sheets').delete().eq('id', testSheetId)
        testSheetId = null
        updateResult('fluxo', 'ok', 'Criar ficha → criar save → listar → deletar OK.')
      } catch (err) {
        if (testSheetId) {
          await supabase.from('game_saves').delete().eq('sheet_id', testSheetId)
          await supabase.from('character_sheets').delete().eq('id', testSheetId)
          testSheetId = null
        }
        updateResult('fluxo', 'fail', err.message)
      }
    }
    await sleep(150)

    // 6. Tabelas auxiliares
    updateResult('aux', 'running')
    await sleep(200)
    const auxTables = ['toptrumps_stats', 'toptrumps_salas', 'share_submissions']
    const auxResults = []
    for (const table of auxTables) {
      const { error } = await supabase.from(table).select('id').limit(1).maybeSingle()
      auxResults.push({ table, ok: !error || error.code !== '42P01' })
    }
    const okCount = auxResults.filter(r => r.ok).length
    if (okCount === auxTables.length) {
      updateResult('aux', 'ok', 'Todas as tabelas auxiliares acessíveis.')
    } else {
      const failed = auxResults.filter(r => !r.ok).map(r => r.table)
      updateResult('aux', 'ok', `${okCount}/${auxTables.length} disponíveis. Ausentes: ${failed.join(', ')}`)
    }

    setRunning(false)
  }, [user, updateResult])

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      runTests()
    }
  }, [user, runTests])

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="ldi-page--sheet">
        <div className="ldi-sheet" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--ldi-danger)', fontFamily: 'var(--font-ui)' }}>Acesso negado.</p>
          <button onClick={() => navigate('/extras')} className="ldi-btn ldi-btn--outline" style={{ marginTop: '1rem' }}>
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const total = Object.keys(results).length
  const passed = Object.values(results).filter(r => r.status === 'ok').length
  const failed = Object.values(results).filter(r => r.status === 'fail').length

  return (
    <div className="ldi-page--sheet">
      <div className="ldi-sheet" style={{ maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-onomatopeia)',
            fontSize: '1.8rem',
            color: 'var(--ldi-text)',
            letterSpacing: '0.05em',
          }}>
            LDI SYSTEM DIAGNOSTICS
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--ldi-muted)' }}>
            v{LDI_VERSION} — {user?.email}
          </p>
        </div>

        {running && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-narrative)', color: 'var(--ldi-muted)' }}>Executando testes...</span>
          </div>
        )}

        {Object.entries(STEP_LABELS).map(([key, label]) => (
          <Step
            key={key}
            label={label}
            status={results[key]?.status || 'idle'}
            detail={results[key]?.detail}
            sql={results[key]?.sql}
          />
        ))}

        {!running && total > 0 && (
          <>
            <div className="ldi-diagnostico-divider" />
            <div className="ldi-diagnostico-summary">
              <span className="ldi-diagnostico-result">
                RESULTADO: {passed}/{total} testes passaram
              </span>
              {failed > 0 && (
                <span className="ldi-diagnostico-action">
                  AÇÕES NECESSÁRIAS: {failed} SQL(s) para rodar no Supabase
                </span>
              )}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={runTests} className="ldi-btn ldi-btn--primary">
                RODAR NOVAMENTE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
