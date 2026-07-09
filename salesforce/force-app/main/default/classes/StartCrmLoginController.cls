public without sharing class StartCrmLoginController {

    @AuraEnabled
    public static String login(String username, String password) {
        if (String.isBlank(username)) {
            throw new AuraHandledException('Informe o usuário.');
        }
        if (String.isBlank(password)) {
            throw new AuraHandledException('Informe a senha.');
        }

        username = username.trim().left(255);
        password = password.left(255);

        try {
            ApexPages.PageReference ref = Site.login(username, password, '/');
            if (ref != null) {
                return ref.getUrl();
            }
            throw new AuraHandledException('Usuário ou senha incorretos.');
        } catch (AuraHandledException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AuraHandledException('Usuário ou senha incorretos.');
        }
    }

    @AuraEnabled
    public static void forgotPassword(String username) {
        if (String.isBlank(username)) {
            throw new AuraHandledException('Informe o e-mail cadastrado.');
        }
        try {
            Site.forgotPassword(username.trim().left(255));
        } catch (Exception ex) {
            // Silencioso por segurança: não revela se o usuário existe ou não.
        }
    }
}
