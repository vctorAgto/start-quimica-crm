import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/StartCrmController.getAccounts';
import STARTLOGO from '@salesforce/resourceUrl/startLogo';

const STATUS_META = {
    ativo: { cor: '#1f9d55', label: 'Ativos' },
    atencao: { cor: '#d9891f', label: 'Atenção' },
    risco: { cor: '#dd3b3b', label: 'Em risco' },
    prospeccao: { cor: '#2f6fed', label: 'Prospecção' },
};

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', ic: '▦' },
    { id: 'cockpit', label: 'Cockpit de IA', ic: '✦' },
    { id: 'equipe', label: 'Equipe & carteira', ic: '◧' },
    { id: 'mapa', label: 'Mapa de mercado', ic: '◎' },
    { id: 'ranking', label: 'Ranking', ic: '▲' },
];

const RANKING = [
    { pos: 1, nome: 'Ana Beatriz', regiao: 'BH Capital', valor: 'R$ 512k', pct: 100, me: false },
    { pos: 2, nome: 'Carlos Eduardo', regiao: 'Triângulo', valor: 'R$ 420k', pct: 82, me: true },
    { pos: 3, nome: 'Rafael Souza', regiao: 'Sul de Minas', valor: 'R$ 388k', pct: 76, me: false },
    { pos: 4, nome: 'Letícia Alves', regiao: 'Norte', valor: 'R$ 311k', pct: 61, me: false },
    { pos: 5, nome: 'Bruno Lima', regiao: 'Vale do Aço', valor: 'R$ 287k', pct: 56, me: false },
    { pos: 6, nome: 'Marina Costa', regiao: 'Zona da Mata', valor: 'R$ 244k', pct: 48, me: false },
    { pos: 7, nome: 'Diego Fernandes', regiao: 'Noroeste', valor: 'R$ 201k', pct: 39, me: false },
    { pos: 8, nome: 'Juliana Prado', regiao: 'Sul de Minas', valor: 'R$ 176k', pct: 34, me: false },
];

const RECOS = [
    { id: 'churn1', tipo: 'churn', tag: 'Prevenção de churn', titulo: 'Visitar Hospital São José', desc: 'Churn estimado em 78% — 52 dias sem compra e queda de ticket. Janela de ação curta.', impacto: 'Reter R$ 96k/ano', cta: 'Planejar visita' },
    { id: 'cross1', tipo: 'cross', tag: 'Cross-sell · mix ideal', titulo: 'Oferecer Asseptgel Pro à Santa Clara', desc: '87% dos clientes de perfil semelhante já compram este item. Conta saudável e receptiva.', impacto: '+R$ 42k/ano', cta: 'Adicionar à proposta' },
    { id: 'lead1', tipo: 'lead', tag: 'Geração de lead', titulo: 'Prospectar Supermercado ABC', desc: 'Mapeamento aponta alta propensão na região de Araguari. Sem fornecedor ativo da categoria.', impacto: 'Potencial R$ 180k/ano', cta: 'Criar lead' },
    { id: 'react1', tipo: 'react', tag: 'Reativação', titulo: 'Reativar Restaurante Sabor Mineiro', desc: 'Inativo há 6 meses, alta rentabilidade histórica. Motivo: troca de comprador.', impacto: 'Recuperar R$ 64k/ano', cta: 'Planejar visita' },
];

const MAPA_PONTOS = [
    { x: 22, y: 38, status: 'ativo', nome: 'Hospital Santa Clara', cidade: 'Uberlândia/MG', fat: 'R$ 312k' },
    { x: 70, y: 20, status: 'atencao', nome: 'Distribuidora Bella', cidade: 'Uberlândia/MG', fat: 'R$ 96k' },
    { x: 63, y: 52, status: 'prospeccao', nome: 'Supermercado ABC', cidade: 'Araguari/MG', fat: 'potencial R$ 180k/ano' },
    { x: 38, y: 68, status: 'risco', nome: 'Hospital XPTO', cidade: 'Araguari/MG', fat: 'R$ 88k' },
    { x: 80, y: 58, status: 'ativo', nome: 'Frigorífico Vale Verde', cidade: 'Patos de Minas/MG', fat: 'R$ 203k' },
    { x: 47, y: 30, status: 'prospeccao', nome: 'Mercado Bom Preço', cidade: 'Uberaba/MG', fat: 'potencial R$ 140k/ano' },
    { x: 15, y: 60, status: 'atencao', nome: 'Laticínios Serra Azul', cidade: 'Patrocínio/MG', fat: 'R$ 61k' },
    { x: 58, y: 75, status: 'ativo', nome: 'Mercado União', cidade: 'Uberaba/MG', fat: 'R$ 246k' },
    { x: 33, y: 22, status: 'ativo', nome: 'Agro Cerrado Insumos', cidade: 'Uberlândia/MG', fat: 'R$ 178k' },
    { x: 55, y: 44, status: 'risco', nome: 'Pet Center Patas & Cia', cidade: 'Uberlândia/MG', fat: 'R$ 54k' },
    { x: 88, y: 35, status: 'atencao', nome: 'Clínica Vida Plena', cidade: 'Ituiutaba/MG', fat: 'R$ 35k' },
    { x: 12, y: 80, status: 'prospeccao', nome: 'Rede Center Farma', cidade: 'Uberlândia/MG', fat: 'potencial R$ 95k/ano' },
];

const PROSPECCOES = [
    { nome: 'Supermercado ABC', cidade: 'Araguari/MG', motivo: 'Sem fornecedor ativo da categoria', valor: 'R$ 180k/ano' },
    { nome: 'Mercado Bom Preço', cidade: 'Uberaba/MG', motivo: 'Mesmo porte de contas Azulim ativas na região', valor: 'R$ 140k/ano' },
    { nome: 'Rede Center Farma', cidade: 'Uberlândia/MG', motivo: 'Alta propensão por perfil de compra similar', valor: 'R$ 95k/ano' },
];

export default class StartCrmApp extends LightningElement {
    logoUrl = STARTLOGO;

    @track dpage = 'dashboard';
    @track dperiod = 'Mês';
    @track cockpitTab = 'cartoes';
    @track mapaSel = null;
    @track doneRecos = [];
    @track activities = [];
    @track realAccounts = [];
    @track accountsError;

    periods = ['Mês', 'Trimestre', 'Ano'];

    @wire(getAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.realAccounts = data;
            this.accountsError = undefined;
        } else if (error) {
            this.accountsError = error;
            this.realAccounts = [];
        }
    }

    get hasRealAccounts() { return this.realAccounts && this.realAccounts.length > 0; }
    get hasAccountsError() { return !!this.accountsError; }

    formatCurrency(v) {
        return 'R$ ' + Number(v).toLocaleString('pt-BR');
    }

    get realAccountsView() {
        return this.realAccounts.map((a) => ({
            Id: a.Id,
            Name: a.Name,
            location: [a.BillingCity, a.BillingState].filter(Boolean).join('/') || '—',
            industry: a.Industry || '—',
            revenue: a.AnnualRevenue ? this.formatCurrency(a.AnnualRevenue) : '—',
        }));
    }

    nowHM() {
        return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // ---------- page switching ----------
    get isDashboard() { return this.dpage === 'dashboard'; }
    get isCockpit() { return this.dpage === 'cockpit'; }
    get isEquipe() { return this.dpage === 'equipe'; }
    get isMapa() { return this.dpage === 'mapa'; }
    get isRanking() { return this.dpage === 'ranking'; }

    get navItemsView() {
        return NAV_ITEMS.map((n) => ({
            ...n,
            cssClass: 'nav-link' + (this.dpage === n.id ? ' active' : ''),
        }));
    }
    handleNav(event) {
        this.dpage = event.currentTarget.dataset.page;
    }

    get periodsView() {
        return this.periods.map((p) => ({
            label: p,
            cssClass: 'seg-btn' + (this.dperiod === p ? ' active' : ''),
        }));
    }
    handlePeriod(event) {
        this.dperiod = event.currentTarget.dataset.period;
    }

    // ---------- dashboard mini map ----------
    get miniMapDots() {
        return MAPA_PONTOS.map((p) => ({
            nome: p.nome,
            style: `left:${p.x}%; top:${p.y}%; background:${STATUS_META[p.status].cor};`,
        }));
    }

    // ---------- cockpit ----------
    get cockpitIsCartoes() { return this.cockpitTab === 'cartoes'; }
    get cockpitIsFila() { return this.cockpitTab === 'fila'; }
    handleCockpitTab(event) {
        this.cockpitTab = event.currentTarget.dataset.tab;
    }

    get recosView() {
        const borderColor = { churn: 'var(--red)', cross: 'var(--cyan)', lead: 'var(--green)', react: 'var(--amber)' };
        const impactColor = { churn: 'var(--red)' };
        return RECOS.map((r) => {
            const isDone = this.doneRecos.includes(r.id);
            return {
                ...r,
                isDone,
                cardClass: `reco-card ${r.tipo}${isDone ? ' is-done' : ''}`,
                queueClass: `queue-row ${r.tipo}${isDone ? ' is-done' : ''}`,
                queueStyle: `border-left-color:${borderColor[r.tipo] || 'var(--blue)'}`,
                impactStyle: `color:${impactColor[r.tipo] || 'var(--green)'}`,
            };
        });
    }
    handleMarkReco(event) {
        const id = event.currentTarget.dataset.id;
        const label = event.currentTarget.dataset.label;
        if (!this.doneRecos.includes(id)) {
            this.doneRecos = [...this.doneRecos, id];
            const reco = RECOS.find((r) => r.id === id);
            this.activities = [{ id: Date.now() + '', msg: `${label}: "${reco.titulo}"`, time: this.nowHM() }, ...this.activities].slice(0, 8);
        }
    }
    get hasActivities() { return this.activities.length > 0; }

    // ---------- equipe & carteira ----------
    get equipeRows() {
        return RANKING.map((r) => ({
            key: r.pos,
            nome: r.nome,
            regiao: r.regiao,
            carteira: `${60 + r.pos * 3} / ${90 + r.pos * 2}`,
            cobertura: `${80 - r.pos * 3}%`,
            meta: `${r.pct}%`,
            churn: r.pos % 3 === 0 ? `6,${r.pos}%` : `2,${r.pos}%`,
            churnStyle: r.pos % 3 === 0 ? 'color:var(--red)' : 'color:var(--green)',
        }));
    }

    // ---------- ranking ----------
    get rankingFullView() { return this.buildRankingView(RANKING); }
    get rankingTop5View() { return this.buildRankingView(RANKING.slice(0, 5)); }
    buildRankingView(list) {
        return list.map((r) => ({
            ...r,
            key: r.pos,
            rowClass: 'rank-item' + (r.pos === 1 ? ' p1' : r.me ? ' p2' : ''),
            barStyle: `width:${r.pct}%`,
        }));
    }

    // ---------- mapa de mercado ----------
    get mapaCounts() {
        const c = { ativo: 0, atencao: 0, risco: 0, prospeccao: 0 };
        MAPA_PONTOS.forEach((p) => { c[p.status] += 1; });
        return c;
    }
    get mapaPontosView() {
        return MAPA_PONTOS.map((p, i) => {
            const sel = this.mapaSel === i;
            return {
                nome: p.nome,
                idx: i + '',
                style: `left:${p.x}%; top:${p.y}%; background:${STATUS_META[p.status].cor}; cursor:pointer;${sel ? ' width:18px;height:18px;box-shadow:0 0 0 4px rgba(47,111,237,.25);' : ''}`,
            };
        });
    }
    get prospeccoes() { return PROSPECCOES; }
    get selectedPointView() {
        if (this.mapaSel === null || this.mapaSel === undefined) return null;
        const p = MAPA_PONTOS[this.mapaSel];
        const meta = STATUS_META[p.status];
        return {
            ...p,
            statusLabel: meta.label,
            statusStyle: `color:${meta.cor}`,
            fatLabel: p.status === 'prospeccao' ? 'Potencial estimado' : 'Faturamento',
        };
    }
    get hasSelectedPoint() { return !!this.selectedPointView; }
    handleMapaSelect(event) {
        this.mapaSel = parseInt(event.currentTarget.dataset.idx, 10);
    }
}
