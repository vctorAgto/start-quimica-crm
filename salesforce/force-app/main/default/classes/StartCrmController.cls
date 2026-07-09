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

    public class OppWrapper {
        @AuraEnabled public String name;
        @AuraEnabled public String stage;
        @AuraEnabled public Decimal amount;
        @AuraEnabled public String closeDate;
    }

    public class RcaDetailWrapper {
        @AuraEnabled public String contactId;
        @AuraEnabled public String name;
        @AuraEnabled public String cpf;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String address;
        @AuraEnabled public List<OppWrapper> opportunities;
    }

    @AuraEnabled(cacheable=true)
    public static RcaDetailWrapper getRcaDetail(Id contactId) {
        if (contactId == null) {
            return null;
        }
        List<Contact> matches = [
            SELECT Id, Name, CPF__c, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode
            FROM Contact
            WHERE Id = :contactId
            LIMIT 1
        ];
        if (matches.isEmpty()) {
            return null;
        }
        Contact c = matches[0];

        List<String> addressParts = new List<String>();
        for (String part : new List<String>{ c.MailingStreet, c.MailingCity, c.MailingState, c.MailingPostalCode }) {
            if (String.isNotBlank(part)) {
                addressParts.add(part);
            }
        }

        RcaDetailWrapper w = new RcaDetailWrapper();
        w.contactId = c.Id;
        w.name = c.Name;
        w.cpf = c.CPF__c;
        w.email = c.Email;
        w.phone = c.Phone;
        w.address = String.join(addressParts, ', ');

        List<OppWrapper> ows = new List<OppWrapper>();
        for (Opportunity o : [
            SELECT Name, StageName, Amount, CloseDate
            FROM Opportunity
            WHERE RCA__c = :contactId
            ORDER BY CloseDate ASC
        ]) {
            OppWrapper ow = new OppWrapper();
            ow.name = o.Name;
            ow.stage = o.StageName;
            ow.amount = o.Amount;
            ow.closeDate = o.CloseDate != null ? o.CloseDate.format() : null;
            ows.add(ow);
        }
        w.opportunities = ows;
        return w;
    }
}
