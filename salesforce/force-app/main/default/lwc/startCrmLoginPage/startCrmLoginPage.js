import { LightningElement, track } from 'lwc';
import STARTLOGO from '@salesforce/resourceUrl/startLogo';
import login from '@salesforce/apex/StartCrmLoginController.login';
import forgotPassword from '@salesforce/apex/StartCrmLoginController.forgotPassword';

export default class StartCrmLoginPage extends LightningElement {
    @track loading = false;
    @track telaEsqueciSenha = false;
    @track resetEnviado = false;
    @track erros = {};

    logoUrl = STARTLOGO;

    _form = { username: '', password: '', emailReset: '' };

    get anoAtual() {
        return new Date().getFullYear();
    }
    get usernameClass() {
        return 'sq-login__input' + (this.erros.username ? ' sq-login__input--error' : '');
    }
    get passwordClass() {
        return 'sq-login__input' + (this.erros.password ? ' sq-login__input--error' : '');
    }
    get emailClass() {
        return 'sq-login__input' + (this.erros.emailReset ? ' sq-login__input--error' : '');
    }

    handleInput(event) {
        const field = event.currentTarget.dataset.field;
        this._form[field] = event.currentTarget.value;
        if (this.erros[field]) this.erros = { ...this.erros, [field]: '' };
        if (this.erros.geral) this.erros = { ...this.erros, geral: '' };
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') this.handleLogin();
    }

    handleEsqueciSenha() {
        this.telaEsqueciSenha = true;
        this.erros = {};
        this.resetEnviado = false;
    }

    handleVoltarLogin() {
        this.telaEsqueciSenha = false;
        this.erros = {};
        this.resetEnviado = false;
    }

    _validarLogin() {
        const erros = {};
        if (!this._form.username?.trim()) erros.username = 'Informe o usuário.';
        if (!this._form.password?.trim()) erros.password = 'Informe a senha.';
        this.erros = erros;
        return Object.keys(erros).length === 0;
    }

    _validarReset() {
        const erros = {};
        if (!this._form.emailReset?.trim()) erros.emailReset = 'Informe o e-mail cadastrado.';
        this.erros = erros;
        return Object.keys(erros).length === 0;
    }

    async handleLogin() {
        if (!this._validarLogin() || this.loading) return;
        this.loading = true;
        this.erros = {};
        try {
            const url = await login({ username: this._form.username.trim(), password: this._form.password });
            if (url) window.location.replace(url);
        } catch (e) {
            const msg = e?.body?.message || e?.message || 'Usuário ou senha incorretos.';
            this.erros = { geral: msg };
        } finally {
            this.loading = false;
        }
    }

    async handleEnviarReset() {
        if (!this._validarReset() || this.loading) return;
        this.loading = true;
        this.erros = {};
        try {
            await forgotPassword({ username: this._form.emailReset.trim() });
            this.resetEnviado = true;
        } catch (e) {
            const msg = e?.body?.message || e?.message || 'Não foi possível enviar o e-mail.';
            this.erros = { geral: msg };
        } finally {
            this.loading = false;
        }
    }
}
