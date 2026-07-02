import { useKpI18n } from '../hooks/useKpI18n'

function Cover({ m }) {
  return (
    <div className="man-cover">
      <div className="man-reticle" />
      <div className="man-tag">{m.tag}</div>
      <div className="man-title">KERNEL<br />PANIC</div>
      <div className="man-sub">{m.sub}</div>
      <div className="man-desc">{m.desc}</div>
      <div className="man-badge">{m.badge}</div>
    </div>
  )
}

function Section({ tag, title, children, titleClass }) {
  return (
    <div className="man-section">
      <div className="man-section-tag">{tag}</div>
      <div className={`man-section-title ${titleClass || ''}`}>{title}</div>
      {children}
    </div>
  )
}

function P({ children }) {
  return <p className="man-p">{children}</p>
}

function Box({ title, children, cls }) {
  return (
    <div className={`man-box ${cls || ''}`}>
      {title && <span className="man-box-title">{title}</span>}
      {children}
    </div>
  )
}

function Warning({ children }) {
  return <div className="man-warning">{children}</div>
}

function CardItem({ accent, name, desc }) {
  return (
    <div className="man-card-item">
      <div className={`man-card-accent ${accent}`} />
      <div className="man-card-body">
        <div className={`man-card-type ${accent}`}>{name}</div>
        <div className="man-card-desc">{desc}</div>
      </div>
    </div>
  )
}

function CardItemFull({ accent, type, name, desc }) {
  return (
    <div className="man-card-item">
      <div className={`man-card-accent ${accent}`} />
      <div className="man-card-body">
        <div className={`man-card-type ${accent}`}>{type}</div>
        <div className="man-card-name">{name}</div>
        <div className="man-card-desc">{desc}</div>
      </div>
    </div>
  )
}

function AttrCard({ name, vs, desc, cls }) {
  return (
    <div className="man-attr-card">
      <div className={`man-attr-name ${cls}`}>{name}</div>
      <div className="man-attr-vs">{vs}</div>
      <div className="man-attr-desc">{desc}</div>
    </div>
  )
}

function Step({ num, title, desc, optional }) {
  return (
    <div className={`man-step ${optional ? 'man-step-optional' : ''}`}>
      <div className="man-step-num">{num}</div>
      <div className="man-step-body">
        <div className="man-step-title">{title}</div>
        <div className="man-step-desc">{desc}</div>
      </div>
    </div>
  )
}

function Formula({ eq, note }) {
  return (
    <div className="man-formula">
      <div className="man-formula-eq">{eq}</div>
      {note && <div className="man-formula-note">{note}</div>}
    </div>
  )
}

function Divider({ text }) {
  return (
    <div className="man-divider">
      <span>{text}</span>
    </div>
  )
}

function Footer({ m }) {
  return (
    <div className="man-footer">
      <div>{m.l1}</div>
      <div>{m.l2}</div>
      <div className="man-footer-end">{m.end}</div>
    </div>
  )
}

export default function KPManualModal({ onClose }) {
  const { t } = useKpI18n()

  const m = {
    cover: {
      tag: t('kp.manual.cover.tag'),
      sub: t('kp.manual.cover.sub'),
      desc: t('kp.manual.cover.desc'),
      badge: t('kp.manual.cover.badge'),
    },
    s01: {
      tag: t('kp.manual.s01.tag'),
      title: t('kp.manual.s01.title'),
      p: t('kp.manual.s01.p'),
      boxTitle: t('kp.manual.s01.box_title'),
      boxText: t('kp.manual.s01.box_text'),
    },
    s02: {
      tag: t('kp.manual.s02.tag'),
      title: t('kp.manual.s02.title'),
      intro: t('kp.manual.s02.intro'),
      items: t('kp.manual.s02.items'),
      bufTitle: t('kp.manual.s02.buf_title'),
      bufText: t('kp.manual.s02.buf_text'),
    },
    s03: {
      tag: t('kp.manual.s03.tag'),
      title: t('kp.manual.s03.title'),
      intro: t('kp.manual.s03.intro'),
      mira: t('kp.manual.s03.mira'),
      scan: t('kp.manual.s03.scan'),
      blind: t('kp.manual.s03.blind'),
      ghost: t('kp.manual.s03.ghost'),
      warn: t('kp.manual.s03.warn'),
      exp: t('kp.manual.s03.exp'),
      expTitle: t('kp.manual.s03.exp_title'),
      expRules: t('kp.manual.s03.exp_rules'),
    },
    s04: {
      tag: t('kp.manual.s04.tag'),
      title: t('kp.manual.s04.title'),
      intro: t('kp.manual.s04.intro'),
      steps: t('kp.manual.s04.steps'),
      bufTitle: t('kp.manual.s04.buf_title'),
      bufText: t('kp.manual.s04.buf_text'),
    },
    s05: {
      tag: t('kp.manual.s05.tag'),
      title: t('kp.manual.s05.title'),
      intro: t('kp.manual.s05.intro'),
      steps: t('kp.manual.s05.steps'),
      formulaEq: t('kp.manual.s05.formula_eq'),
      formulaNote: t('kp.manual.s05.formula_note'),
      negTitle: t('kp.manual.s05.neg_title'),
      negText: t('kp.manual.s05.neg_text'),
      acerto: t('kp.manual.s05.acerto'),
      falha: t('kp.manual.s05.falha'),
    },
    s06: {
      tag: t('kp.manual.s06.tag'),
      title: t('kp.manual.s06.title'),
      items: t('kp.manual.s06.items'),
      efeitosTitle: t('kp.manual.s06.efeitos_title'),
      efeitos: t('kp.manual.s06.efeitos'),
      equipTitle: t('kp.manual.s06.equip_title'),
      equip: t('kp.manual.s06.equip'),
    },
    s07: {
      tag: t('kp.manual.s07.tag'),
      title: t('kp.manual.s07.title'),
      intro: t('kp.manual.s07.intro'),
      items: t('kp.manual.s07.items'),
    },
    s08: {
      tag: t('kp.manual.s08.tag'),
      title: t('kp.manual.s08.title'),
      intro: t('kp.manual.s08.intro'),
      kpTitle: t('kp.manual.s08.kp_title'),
      kpText: t('kp.manual.s08.kp_text'),
      sfTitle: t('kp.manual.s08.sf_title'),
      sfText: t('kp.manual.s08.sf_text'),
      solo: t('kp.manual.s08.solo'),
      local: t('kp.manual.s08.local'),
    },
    s09: {
      tag: t('kp.manual.s09.tag'),
      title: t('kp.manual.s09.title'),
      items: t('kp.manual.s09.items'),
    },
    footer: {
      l1: t('kp.manual.footer.l1'),
      l2: t('kp.manual.footer.l2'),
      end: t('kp.manual.footer.end'),
    },
  }

  return (
    <div className="man-overlay show" onClick={onClose}>
      <div className="man-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="man-content">
          <Cover m={m.cover} />

          <Section tag={m.s01.tag} title={m.s01.title}>
            {m.s01.p.map((para, i) => <P key={i}>{para}</P>)}
            <Box title={m.s01.boxTitle}>{m.s01.boxText}</Box>
          </Section>

          <Section tag={m.s02.tag} title={m.s02.title} titleClass="purple">
            <P>{m.s02.intro}</P>
            {m.s02.items.map((item, i) => (
              <CardItemFull key={i} accent={item.accent} type={item.type} name={item.name} desc={item.desc} />
            ))}
            <Box cls="purple" title={m.s02.bufTitle}>{m.s02.bufText}</Box>
          </Section>

          <Section tag={m.s03.tag} title={m.s03.title}>
            <P>{m.s03.intro}</P>
            <div className="man-attr-grid">
              <AttrCard name={m.s03.mira.name} vs={m.s03.mira.vs} desc={m.s03.mira.desc} cls="atk" />
              <AttrCard name={m.s03.scan.name} vs={m.s03.scan.vs} desc={m.s03.scan.desc} cls="atk" />
              <AttrCard name={m.s03.blind.name} vs={m.s03.blind.vs} desc={m.s03.blind.desc} cls="def" />
              <AttrCard name={m.s03.ghost.name} vs={m.s03.ghost.vs} desc={m.s03.ghost.desc} cls="def" />
            </div>
            <Warning>{m.s03.warn}</Warning>
            <AttrCard name={m.s03.exp.name} vs={m.s03.exp.vs} desc={m.s03.exp.desc} cls="exp" />
            <Box cls="red" title={m.s03.expTitle}>
              {m.s03.expRules.map((rule, i) => <div key={i}>{rule}</div>)}
            </Box>
          </Section>

          <Section tag={m.s04.tag} title={m.s04.title} titleClass="pink">
            <P>{m.s04.intro}</P>
            {m.s04.steps.map((step, i) => (
              <Step key={i} num={step.num} title={step.title} desc={step.desc} optional={step.optional} />
            ))}
            <Box title={m.s04.bufTitle}>{m.s04.bufText}</Box>
          </Section>

          <Section tag={m.s05.tag} title={m.s05.title}>
            <P>{m.s05.intro}</P>
            <Divider text={t('kp.manual.s05.divider')} />
            {m.s05.steps.map((step, i) => (
              <Step key={i} num={step.num} title={step.title} desc={step.desc} />
            ))}
            <Formula eq={m.s05.formulaEq} note={m.s05.formulaNote} />
            <Box cls="red" title={m.s05.negTitle}>{m.s05.negText}</Box>
            <P>{m.s05.acerto}</P>
            <P>{m.s05.falha}</P>
          </Section>

          <Section tag={m.s06.tag} title={m.s06.title} titleClass="purple">
            {m.s06.items.map((item, i) => (
              <CardItem key={i} accent={item.accent} name={item.name} desc={item.desc} />
            ))}
            <Divider text={m.s06.efeitosTitle} />
            {m.s06.efeitos.map((item, i) => (
              <CardItemFull key={i} accent={item.accent} type={item.type} name={item.name} desc={item.desc} />
            ))}
            <Divider text={m.s06.equipTitle} />
            {m.s06.equip.map((item, i) => (
              <CardItemFull key={i} accent={item.accent} type={item.type} name={item.name} desc={item.desc} />
            ))}
          </Section>

          <Section tag={m.s07.tag} title={m.s07.title} titleClass="pink">
            <P>{m.s07.intro}</P>
            {m.s07.items.map((item, i) => (
              <div key={i} className="man-terrain-item">
                <div className="man-terrain-icon">{item.icon}</div>
                <div className="man-terrain-body">
                  <div className="man-terrain-name">{item.name}</div>
                  <div className="man-terrain-effect">{item.effect}</div>
                </div>
              </div>
            ))}
          </Section>

          <Section tag={m.s08.tag} title={m.s08.title}>
            <P>{m.s08.intro}</P>
            <Box title={m.s08.kpTitle}>{m.s08.kpText}</Box>
            <Box cls="red" title={m.s08.sfTitle}>{m.s08.sfText}</Box>
            <P>{m.s08.solo}</P>
            <P>{m.s08.local}</P>
          </Section>

          <Section tag={m.s09.tag} title={m.s09.title} titleClass="purple">
            {m.s09.items.map((item, i) => (
              <CardItem key={i} accent={item.accent} name={item.name} desc={item.desc} />
            ))}
          </Section>

          <Footer m={m.footer} />
        </div>
        <button className="man-close" onClick={onClose}>{t('kp.inspect.fechar')}</button>
      </div>
    </div>
  )
}