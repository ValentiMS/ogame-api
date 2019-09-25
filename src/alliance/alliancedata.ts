import Universe, { ID, APIAttributes, resolveSolo } from "../universe/universe";
import Alliance, { XMLAlliance } from "./alliance";
import { Solo } from "../../typings/util";

/**Parses XML alliance root file to an Alliance array
 * @category alliance
 */
export default function parseXml(encodedData: XMLAllianceData, universe: Universe) {

    const allianceArray = resolveSolo(encodedData.alliance);
    
    return allianceArray.map(alliance => 
      
        new Alliance(alliance, universe, encodedData.timestamp)

    ) as Alliance[];

}

export interface XMLAllianceData extends APIAttributes {
    alliance: Solo<XMLAlliance>;
}
