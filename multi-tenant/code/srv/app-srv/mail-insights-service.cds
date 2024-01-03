using {aisaas.db as db} from '../../db/data-model';
 
@(requires: [
    'Admin',
    'Member',
    'system-user'
])
service MailInsightsService @(
    path    : 'mail-insights',
    protocol: 'odata-v4'
) {
    entity Mails as projection on db.Mails;
    entity Attributes as projection on db.Attributes;
    // Get all mails (compact)
    function getMails()                                                                             returns array of Mails;

    // Get single mail incl. closest mails
    function getMail(id : UUID)                                                                     returns {
        mail : Association to Mails;
        closestMails : array of {
            similarity : Double;
            mail : Association to Mails;
        };
    };

    // Delete a single mail
    action   deleteMail(id : UUID)                                                                  returns Boolean;
    // Add new mails
    action   addMails(mails : array of db.BaseMail, rag : Boolean null)                             returns array of Mails;
    // Regenerate a single response
    action   regenerateResponse(id : UUID, selectedMails : array of String, additionalInformation : String null) returns Mails;
    // Regenerate similarities for found mails
    action   findMails(searchKeywordSimilarMails : String, id: String)                              returns {closestMails : array of {
                                                                                                        similarity : Double;
                                                                                                        mail : Association to Mails;
                                                                                                        }
                                                                                                    };
    // Regenerate insights of all mails
    action   regenerateInsights(rag : Boolean null,attributes: array of db.AdditionalAttribute )    returns Boolean;
    // Translates response to original language
    action   translateResponse(id : UUID, response : String)                                        returns String;
    // Submits response in working language
    action   submitResponse(id : UUID, response : String)                                           returns Boolean;
    // Revoke answered status 
    action   revokeResponse(id : UUID)                                                              returns Boolean;
};
