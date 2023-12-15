import * as aiCore from "../common/utils/ai-core"; 
import CommonAttribute from "../common/handlers/common-attribute";

/**
 * MailInsightsService class extends CommonMailInsights
 * @extends CommonMailInsights
 */
export default class AttributeApiService extends CommonAttribute {
    /**
     * Initialization method to register CAP Action Handlers
     * @async
     * @returns {Promise<void>}
     */
    async init() {
        // Shared handlers (getMails, getMail, addMails, deleteMail)
        await super.init();

        // Create a default SAP AI Core resource groups if non existent
        await aiCore.checkDefaultResourceGroup();

        // Additional handlers
        
    }

}