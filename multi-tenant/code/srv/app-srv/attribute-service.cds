using {aisaas.db as db} from '../../db/data-model';
 
@(requires: [
    'Admin',
    'Member',
    'system-user'
])
service AttributeService @(
    path    : 'attributes',
    protocol: 'odata-v4'
) {
    entity Attributes as projection on db.Attributes;
   
    // Get all mails (compact)
    function getAttributes()                                                                                     returns array of Attributes;
 
    action   deleteAttribute(ids : many String)                                                                  returns Boolean;
    // Regenerate a single response
    action   addAttributes(attribute : String, explanation : String, valueType : String, values : array of  db.AttributeExplanation) returns array of Attributes;
    action   editAttributes(ids : many String, attributes :  array of Attributes)                                returns array of Attributes;
 
};