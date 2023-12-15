using {aisaas.db} from '../../db/data-model';

@(requires: [
    'Admin',
    'Member',
    'system-user'
])
service AttributeApiService @(
     path    : 'api/attributes',
     protocol: 'rest'
) {
    entity Attributes as projection on db.Attributes;
    function getAttributes()                                                                                returns array of Attributes;

    // Get single mail incl. closest mails
    function getAttribute(id : UUID)  
    returns {
        attribute : Association to Attributes;
    };

    action   deleteAttribute(ids : many String)                                                             returns Boolean;
    action   editAttributes(ids : many String, attributes :  array of Attributes)                           returns array of Attributes;
    action   addAttributes(attribute : String, explanation : String, values : array of db.AttributeExplanation) returns array of Attributes;

}
