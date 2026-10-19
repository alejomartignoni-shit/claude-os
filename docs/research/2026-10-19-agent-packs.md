# Repos del hilo de @romandevz: evaluación

Fecha: 2026-10-19 · Fuente: https://x.com/romandevz/status/2111867588405862713

El texto del tweet se reconstruyó desde el índice de búsqueda, porque X no se pudo abrir desde el entorno. Los cinco repos se clonaron y revisaron directamente ese día.

## Primero, una corrección

El tweet dice "Anthropic ha publicado +400 agentes y skills". **No es así.** Solo 2 de los 5 repos son de Anthropic (`anthropics/*`). Los dos con más estrellas son de la comunidad. Además, hay un issue abierto en `anthropics/skills` sobre skills comunitarias que se hacen pasar por oficiales. Antes de instalar algo, conviene mirar quién es el owner real del repo.

## Veredicto por repo

| Repo | ⭐ | Autor | Qué es | Veredicto |
|---|---|---|---|---|
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | 162k | Comunidad · MIT | ~280 agentes "persona" en `.md`, en 20 divisiones | **Instalar 10 elegidos**, no el repo entero |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 109k | Addy Osmani (no es de Anthropic) · MIT | 25 skills del ciclo dev: define → plan → build → verify → review → ship | **No por ahora**: se solapa con tu harness |
| [wshobson/agents](https://github.com/wshobson/agents) | 41k | Comunidad · MIT | Marketplace con 94 plugins granulares | **Añadir el marketplace + 2 plugins** |
| [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | ~26k (dato del tweet) | Anthropic | Plugins por área: sales, finance, legal, marketing… | **Ya los tienes** en claude.ai/Cowork; no hace falta en local |
| [anthropics/claude-quickstarts](https://github.com/anthropics/claude-quickstarts) | ~18k (dato del tweet) | Anthropic | Apps de ejemplo y Managed Agents (daily brief, Sentry…) | **No se instala**: se extraen patrones (ver abajo) |

## Por qué no instalar todo

- **Coste de contexto.** La `description` de cada agente instalado entra en el contexto de *todas* tus sesiones, porque forma parte de la lista de la herramienta Agent. agency-agents completo son 282 agentes y ~62k caracteres de descripciones: **unos 15k tokens por sesión** antes de escribir nada. Además, la mayoría no te sirve (Douyin, Drupal, GIS, salud…).
- **Peor enrutamiento.** Con muchas skills y agentes de nombre parecido, Claude elige peor cuál usar. Por ejemplo, `test-driven-development` de addy competiría con tu `tdd-workflow`, y tendrías varios `code-reviewer`. Tus 15 agentes y 102 skills ya cubren bien la parte de desarrollo.
- **Seguridad.** Son prompts que corren con tus permisos. Revisé los 10 agentes elegidos: son solo texto, sin scripts ni instrucciones raras. Los dos plugins elegidos de wshobson no traen hooks.

## Qué se instala

`scripts/install_agent_packs.py` hace tres cosas:

1. Clona agency-agents en `~/.claude/vendor/agency-agents`.
2. Copia a `~/.claude/agents` los agentes que lista `scripts/agent-packs.txt`.
3. Añade el marketplace de wshobson e instala dos plugins.

**Agentes** (edita `scripts/agent-packs.txt` para cambiar la lista):

| Agente | Qué hueco cubre |
|---|---|
| Reality Checker | Por defecto responde "NEEDS WORK" y pide pruebas antes de dar algo por listo. Complementa a `code-reviewer`. |
| UI Finish-Gate Reviewer | Detecta UI genérica antes de publicar (sirve para el propio dashboard). |
| Rapid Prototyper | MVPs y pruebas de concepto rápidas. |
| Multi-Agent Systems Architect | Diseño, presupuesto de tokens y gobernanza de sistemas multiagente (claude-os, mars-bot). |
| Product Manager | PRDs y roadmap, la entrada de tu flujo `ralph`. |
| Trend Researcher | Tendencias y análisis competitivo. |
| Feedback Synthesizer | Convierte feedback de usuarios en decisiones. |
| Growth Hacker | Experimentos de adquisición. |
| Content Creator | Calendario editorial y copy multiplataforma. |
| X/Twitter Intelligence Analyst | Investigación con evidencia en X, como la de este mismo hilo. |

Tus agentes actuales son casi todos de ingeniería, así que estos rellenan producto, growth y verificación. Los 10 juntos suman ~2k caracteres de descripciones (menos de 1k tokens), frente a los ~15k tokens del repo entero.

**Plugins** (de wshobson/agents, marketplace `claude-code-workflows`):

- `python-development`: 3 agentes y 16 skills (FastAPI, async, testing, packaging). Es el backend de claude-os.
- `javascript-typescript`: 2 agentes y 4 skills (React, TS moderno). Es el frontend de claude-os.

Si un plugin molesta, se puede desactivar sin desinstalarlo: `claude plugin disable <plugin>`.

## Cómo correrlo (en tu PC)

```powershell
cd C:\Users\Alejo\claude-os
python scripts\install_agent_packs.py --dry-run   # muestra el plan y no cambia nada
python scripts\install_agent_packs.py             # instala o actualiza
```

Después reinicia Claude Code y escribe `/agents`. En claude-os, la página **Agents** muestra ahora una sección **Installed** con todo lo que haya en `~/.claude/agents`.

- **Actualizar:** vuelve a correr el script. Si editaste un agente a mano, el script lo respeta, salvo que pases `--force`.
- **Deshacer:** borra los 10 `.md` de `~/.claude/agents` y ejecuta `claude plugin uninstall python-development@claude-code-workflows` (y lo mismo con `javascript-typescript`).

## Ideas para claude-os (sin instalar nada)

1. **Dream / mars-bot ← `claude-quickstarts/managed-agents/daily-brief`.** Es un agente programado que resume Slack y GitHub cada mañana. Sus patrones de "fallar bien cuando nadie mira" sirven tal cual para Dream:
   - un *bookmark* por fuente, para que una corrida tardía o saltada no pierda nada;
   - un *ledger* para no repetir lo de ayer;
   - **una fuente que no se pudo leer se reporta como ilegible, nunca como "día tranquilo"**;
   - confirmar la publicación antes de registrarla;
   - preferencias en un store de solo lectura que el agente no puede editar.
2. **Memory ← `claude-quickstarts/managed-agents/knowledge-wiki`.** La idea es leer el corpus *una sola vez* y destilarlo a una wiki en markdown con procedencia (`[SOURCE: …]`) en cada dato. Luego se responde desde la wiki en lugar de releer documentos. Encaja con Obsidian AlejoOS + la memoria de Claude: Dream podría mantener esa wiki y el grafo de Memory mostrarla.
3. **Fases de `addyosmani/agent-skills`.** Define → Plan → Build → Verify → Review → Ship es un buen mapa para revisar qué fases ya cubren tus skills. Para probarlo sin compromiso: `/plugin marketplace add addyosmani/agent-skills` y `/plugin install agent-skills@addy-agent-skills`, y lo desactivas si choca con tus skills.
4. **knowledge-work-plugins en local.** Solo vale la pena si conectas sus MCP (Slack, HubSpot…) en Claude Code. El candidato sería `productivity` (tareas y memoria), pero se solapa con tu sistema Obsidian.
