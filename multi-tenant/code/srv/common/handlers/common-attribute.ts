import cds, { ApplicationService } from "@sap/cds";
import { Request } from "@sap/cds/apis/events";
import { IAdditionalAttribute } from "./types";


// Default table used in PostgreSQL
const DEFAULT_TENANT = "_main";

/**
 * Class representing CommonMailInsights
 * @extends ApplicationService
 */
export default class CommonAttribute extends ApplicationService {
    /**
     * Initiate CommonMailInsights instance
     * @returns {Promise<void>}
     */
    async init(): Promise<void> {
        await super.init();

        const { Attribute } = cds.entities;

        // Handler
        this.on("getAttributes", this.onGetAttributes);
        this.on("deleteAttribute", this.onDeleteAttributes);
        this.on("addAttributes", this.onAddAttributes);
        this.on("editAttributes", this.onEditAttributes);
    }

    /**
     * Handler for after reading mails
     * @param {any} mails
     * @returns {Promise<any>}
     */

    private onGetAttributes = async (req: Request): Promise<any> => {
        try {
            const { Attributes } = this.entities;
             const attributes = await SELECT.from(Attributes).columns((a: any) => {
                a.ID;
                a.attribute
            });

            cds.tx(async () => {
                const { Mails } = this.entities;
                const mail = await SELECT.one.from(Mails);
                attributes.forEach(async (attribute: IAdditionalAttribute)=>{
                    const entry: IAdditionalAttribute = {
                        attribute: attribute.attribute,
                        explanation: attribute.explanation,
                        values: attribute.values,
                    }
                    await UPSERT.into(Mails, mail.myAdditionalAttributes).entries(entry);
                })
            });
    
            return attributes;
        } catch (error: any) {
            console.error(`Error: ${error?.message}`);
            return req.error(`Error: ${error?.message}`);
        }
    };

   
    /**
     * Handler for adding mails
     * @param {Request} req
     * @returns {Promise<any>}
     */
    private onAddAttributes = async (req: Request): Promise<any> => {
        try {
            const { Attributes } = this.entities;
            const { attribute,explanation,  values } = req.data;
            /*const attributeBatch = (await this.regenerateAttributes(mail, tenant, additionalAttribute));*/
            const entity: IAdditionalAttribute = {
                attribute: attribute,
                explanation: explanation,
                values: values
            }
            await INSERT.into(Attributes).entries(entity);

        } catch (error: any) {
            console.error(`Error: ${error?.message}`);
            return req.error(`Error: ${error?.message}`);
        }
    };

    private onDeleteAttributes = async (req: Request): Promise<any> => {
        try {
            const { Attributes } = this.entities;
            const { ids } = req.data ;
            ids.forEach(async (id:string)=>{
                await DELETE.from(Attributes, id);
            })

            return true
        } catch (error: any) {
            console.error(`Error: ${error?.message}`);
            return req.error(`Error: ${error?.message}`);
        }
    };
    private onEditAttributes = async (req: Request): Promise<any> => {
        try {
            const { Attributes } = this.entities;
            const { ids, attributes } = req.data;
    
            const updates = attributes.map((attribute: any, index: number) => {
                const updatedEntity: IAdditionalAttribute = {
                    attribute: attribute.attribute,
                    explanation: attribute.explanation,
                    values: attribute.values
                };
                return UPDATE.entity(Attributes).where(`ID = '${ids[index]}'`).set(updatedEntity);
            });
            await Promise.all(updates);
        } catch (error: any) {
            console.error(`Error: ${error?.message}`);
            return req.error(`Error: ${error?.message}`);
        }
    };
    
}


