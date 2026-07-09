public with sharing class StartCrmController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [
            SELECT Id, Name, BillingCity, BillingState, Industry, AnnualRevenue
            FROM Account
            ORDER BY CreatedDate DESC
            LIMIT 20
        ];
    }
}
