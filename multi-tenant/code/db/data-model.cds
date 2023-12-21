using {
      cuid,
      managed
} from '@sap/cds/common';

context aisaas.db {

      type KeyFact {
            fact     : String;
            category : String;
      }

      type Action {
            type          : String;
            value         : String;
            virtual descr : String
      }

      type BaseMail {
            subject            : String;
            body               : String;
            senderEmailAddress : String;
      }

      type AdditionalAttribute {
            attribute: String;
            returnValue: String;
      }

      type AttributeExplanation{
            value:            String; 
            valueExplanation: String; 
      }
      entity Attributes : cuid {
            attribute:        String; 
            explanation:      String; 
            valueType:        String;
            values:           many AttributeExplanation;
      }

      entity Translations : cuid {
            sender            :      String;
            subject           :      String;
            body              :      LargeString;
            summary           :      String;
            responseBody      :      LargeString;
            keyFacts          : many KeyFact;
            requestedServices : many String;
            myAdditionalAttributes : many AdditionalAttribute;
      }

      entity Mails : managed, cuid {
            subject                :      String;
            body                   :      LargeString;
            senderEmailAddress     :      String;
            sender                 :      String;
            responded              :      Boolean default false;
            category               :      String;
            sentiment              :      Integer;
            urgency                :      Integer;
            summary                :      String;
            responseBody           :      LargeString;
            responseModified       :      Boolean;
            languageNameDetermined :      String;
            languageMatch          :      Boolean;
            translation            :      Composition of Translations;
            requestedServices      : many String;
            suggestedActions       : many Action;
            keyFacts               : many KeyFact;
            myAdditionalAttributes : many AdditionalAttribute;
      }
}
