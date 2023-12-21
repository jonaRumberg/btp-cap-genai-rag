import cds, { ApplicationService } from "@sap/cds";
import { Request } from "@sap/cds/apis/events";
import { IAttribute } from "./types";

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
        const { Mails } = cds.entities;

        // Handler
        this.on("getAttributes", this.onGetAttributes);
        this.on("deleteAttribute", this.onDeleteAttributes);
        this.on("addAttributes", this.onAddAttributes);
        this.on("editAttributes", this.onEditAttributes);
     }

    
    private onGetAttributes = async (req: Request): Promise<any> => {
        try {
            const { Attribute } = this.entities;
            const attributes: IAttribute = await SELECT.from(Attribute).columns((a: any) => {
                a.ID;
                a.attribute;
                a.explanation;
                a.valueType;
                a.values; 
            });
            return attributes;
        } catch (error: any) {
            console.error(`Error: ${error?.message}`);
            return req.error(`Error: ${error?.message}`);
        }
    };

  
    private onAddAttributes = async (req: Request): Promise<any> => {
        try {
            const { Attributes } = this.entities;
            const { attribute,explanation, valueType,  values } = req.data;
            const entity: IAttribute = {
                attribute: attribute,
                explanation: explanation,
                valueType: valueType,
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
            //const { Mails } = this.entities;            
            const { ids } = req.data ;

            ids.forEach(async (id: string)=>{
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
                const updatedEntity: IAttribute = {
                    attribute: attribute.attribute,
                    explanation: attribute.explanation,
                    valueType: attribute.valueType,
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


