public without sharing class StartCrmController {
    @AuraEnabled
    public static Id createAccount(String name, String city, String state, String industry, Decimal annualRevenue) {
        if (String.isBlank(name)) {
            throw new AuraHandledException('Informe o nome da conta.');
        }
        try {
            Account acc = new Account(
                Name = name,
                BillingCity = city,
                BillingState = state,
                Industry = industry,
                AnnualRevenue = annualRevenue
            );
            insert acc;
            return acc.Id;
        } catch (DmlException ex) {
            throw new AuraHandledException(ex.getDmlMessage(0));
        }
    }

    public class UserInfoWrapper {
        @AuraEnabled public String name;
        @AuraEnabled public String profileName;
    }

    @AuraEnabled(cacheable=true)
    public static UserInfoWrapper getCurrentUserInfo() {
        UserInfoWrapper w = new UserInfoWrapper();
        w.name = UserInfo.getName();
        w.profileName = '';
        try {
            List<Profile> matches = [SELECT Name FROM Profile WHERE Id = :UserInfo.getProfileId() LIMIT 1];
            if (!matches.isEmpty()) {
                w.profileName = matches[0].Name;
            }
        } catch (Exception ex) {
            // Sem acesso ao objeto Profile para este tipo de licença — segue sem subtítulo.
        }
        return w;
    }

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
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String stage;
        @AuraEnabled public Decimal amount;
        @AuraEnabled public String closeDate;
    }

    public class TaskWrapper {
        @AuraEnabled public String subject;
        @AuraEnabled public String status;
        @AuraEnabled public String activityDate;
        @AuraEnabled public String whoName;
    }

    public class OpportunityDetailWrapper {
        @AuraEnabled public String oppId;
        @AuraEnabled public String name;
        @AuraEnabled public String stage;
        @AuraEnabled public Decimal amount;
        @AuraEnabled public String closeDate;
        @AuraEnabled public String accountName;
        @AuraEnabled public List<TaskWrapper> activities;
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
            SELECT Id, Name, StageName, Amount, CloseDate
            FROM Opportunity
            WHERE RCA__c = :contactId
            ORDER BY CloseDate ASC
        ]) {
            OppWrapper ow = new OppWrapper();
            ow.id = o.Id;
            ow.name = o.Name;
            ow.stage = o.StageName;
            ow.amount = o.Amount;
            ow.closeDate = o.CloseDate != null ? o.CloseDate.format() : null;
            ows.add(ow);
        }
        w.opportunities = ows;
        return w;
    }

    @AuraEnabled(cacheable=true)
    public static OpportunityDetailWrapper getOpportunityDetail(Id oppId) {
        if (oppId == null) {
            return null;
        }
        List<Opportunity> matches = [
            SELECT Id, Name, StageName, Amount, CloseDate, Account.Name
            FROM Opportunity
            WHERE Id = :oppId
            LIMIT 1
        ];
        if (matches.isEmpty()) {
            return null;
        }
        Opportunity o = matches[0];

        OpportunityDetailWrapper w = new OpportunityDetailWrapper();
        w.oppId = o.Id;
        w.name = o.Name;
        w.stage = o.StageName;
        w.amount = o.Amount;
        w.closeDate = o.CloseDate != null ? o.CloseDate.format() : null;
        w.accountName = o.Account != null ? o.Account.Name : null;

        List<TaskWrapper> tasks = new List<TaskWrapper>();
        for (Task t : [
            SELECT Subject, Status, ActivityDate, Who.Name
            FROM Task
            WHERE WhatId = :oppId
            ORDER BY ActivityDate DESC NULLS LAST
            LIMIT 10
        ]) {
            TaskWrapper tw = new TaskWrapper();
            tw.subject = t.Subject;
            tw.status = t.Status;
            tw.activityDate = t.ActivityDate != null ? t.ActivityDate.format() : null;
            tw.whoName = t.Who != null ? t.Who.Name : null;
            tasks.add(tw);
        }
        w.activities = tasks;
        return w;
    }

    public class LeadDetailWrapper {
        @AuraEnabled public String leadId;
        @AuraEnabled public String company;
        @AuraEnabled public String city;
        @AuraEnabled public String state;
        @AuraEnabled public String status;
        @AuraEnabled public String description;
    }

    @AuraEnabled(cacheable=true)
    public static LeadDetailWrapper getLeadDetail(Id leadId) {
        if (leadId == null) {
            return null;
        }
        List<Lead> matches = [
            SELECT Id, Company, City, State, Status, Description
            FROM Lead
            WHERE Id = :leadId
            LIMIT 1
        ];
        if (matches.isEmpty()) {
            return null;
        }
        Lead l = matches[0];
        LeadDetailWrapper w = new LeadDetailWrapper();
        w.leadId = l.Id;
        w.company = l.Company;
        w.city = l.City;
        w.state = l.State;
        w.status = l.Status;
        w.description = l.Description;
        return w;
    }
}
