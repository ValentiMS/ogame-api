import { parse } from "fast-xml-parser";
import Planet from "../planet/planet";
import PlayerData, { XMLPlayerData } from "../player/playerdata";
import PlanetData, { XMLPlanetData } from "../planet/planetdata";
import AllianceData, { XMLAllianceData } from "../alliance/alliancedata";
import ServerData, { XMLServerData, ServerMap } from "./serverData";
import LocalizationData, { XMLLocalizationData, LocalizationMap } from "../localization/localizationData";
import PositionData, { XMLPositionData, PositionCategory, PositionType } from "../position/positionData";
import ifetch from "isomorphic-fetch";
import PlanetReport from "../report/planet";
import { ResolveSolo, Solo } from "../../typings/util";
import { PositionType as PositionTypeEnum } from "../position/position";
import Player, { XMLPlayer } from "../player/player";
import { ExtendedLazyPlayer } from "../player/lazyplayer";
import Alliance from "../alliance/alliance";
import { fetch } from "../xml";

export type ID = number | string;
export const resolveSolo = <T>(solo: T): ResolveSolo<T> => {

    return (Array.isArray(solo) ? solo : [solo]) as ResolveSolo<T>;

};

/**@category universes */
export default class Universe {

    public readonly endpoint: string;

    /**@param id Universe's ID
     * @param region Universe's region
     * Used by official GameForge servers
     */
    public constructor(id: ID, region: Region);
    public constructor(encodedData: XMLUniverse);

    /**@param endpoint Universe's API endpoint
     * Used by unofficial servers
     */
    public constructor(endpoint: string);

    /**@todo Disable XMLUniverse href parsing */
    public constructor(encodedData: ID | XMLUniverse | string, arg1?: Region) {

        this.endpoint = Universe["parseEndpoint"](encodedData, arg1);

    }

    /**Gets universe's players */
    public async getPlayerData(): Promise<ExtendedLazyPlayer[]> {

        const playerData = await fetch<XMLPlayerData>(this.endpoint, "players");
        
        return PlayerData(playerData, this);
    
    }

    /**Gets universe's planets */
    public async getPlanetData(): Promise<Planet[]> {

        const planetData = await fetch<XMLPlanetData>(this.endpoint, "universe");
        
        return PlanetData(planetData, this);
    
    }

    /**Gets universe's alliances */
    public async getAllianceData(): Promise<Alliance[]> {

        const allianceData = await fetch<XMLAllianceData>(this.endpoint, "alliances");
        
        return AllianceData(allianceData, this);
    
    };

    /**Gets universe's player positions (highscore) */
    public async getPlayerPositions<T extends PositionTypeEnum>(type: T) {

        const query = `category=1&type=${type}`;
        const positionsData = await fetch<XMLPositionData<PositionCategory.PLAYER, T>>(this.endpoint, "highscore", query);
        const positions = PositionData(positionsData, this) as PositionType<PositionCategory.PLAYER, T>[];

        return positions;

    };

    /**Gets universe's alliance positions (highscore) */
    public async getAlliancePositions<T extends PositionTypeEnum>(type: T) {

        const query = `category=2&type=${type}`;
        const positionsData = await fetch<XMLPositionData<PositionCategory.ALLIANCE, T>>(this.endpoint, "highscore", query);
        const positions = PositionData(positionsData, this) as PositionType<PositionCategory.ALLIANCE, T>[];

        return positions;
        
    }

    /**Gets universe's "nearby" universes
     * @todo Migrate to global export, unlink from Universe id
     * @todo fix naming
     */
    public async getNearbyUniverses(): Promise<Universe[]> {

        const universesData = await fetch<XMLUniverses>(this.endpoint, "universes");
        const array = resolveSolo(universesData.universe);

        return array.map(universe => new Universe(universe));
    
    }

    /**Gets universe's properties */
    public async getServerData(): Promise<ServerMap> {

        const serverData = await fetch<XMLServerData>(this.endpoint, "serverData");

        return ServerData(serverData);
    
    }

    /**Gets universe's localizations */
    public async getLocalizations(): Promise<LocalizationMap> {

        const localizationData = await fetch<XMLLocalizationData>(this.endpoint, "localization");

        return LocalizationData(localizationData, this);
    
    }

    /**Parses a planet report
     * @deprecated
     */
    public createPlanetReport(encodedData: string) {

        return new PlanetReport(encodedData, this);

    }
    
    /**Gets full player (no references) by id */
    public async getPlayer(id: string) {

        const playerData = await fetch<XMLPlayer>(this.endpoint, "playerData", `id=${id}`);

        return new Player(playerData, this);

    }

    /**Parses the universe id and region to create an API endpoint
     */
    private static parseEndpoint(arg1: ID | XMLUniverse | string, arg2?: Region) {

        const factory = (id: string, region: string) => `https://${id}-${region}.ogame.gameforge.com/api`;

        const endpoint = !arg2 ? (arg1 as XMLUniverse)["href"] || arg1 as string
        : factory(typeof arg1 === "number" ? "s" + arg1 : (arg1 as string).toLowerCase(), arg2);

        return endpoint;
    
    }
    

}





export interface XMLUniverses {
    universe: Solo<XMLUniverse>;
}

export interface XMLUniverse {
    id: string;
    href: string;
}

/**Universe's region
 * @todo Investigate adding more regions
 * @utility
 */
export type Region = "ar" | "br" | "dk" | "de" | "es" | "fr" | "hr" | "it" | "hu" | "mx" | "nl" | "no" | "pl" | "pt" | "ro" | "si" | "sk" | "fi" | "se" | "tr" | "us" | "en" | "cz" | "gr" | "ru" | "tw" | "jp";

/**@ignore */
export interface APIAttributes {
    "xmlns:xsi": string;
    "xsi:noNamespaceSchemaLocation": string;
    timestamp: string;
    serverId: string;
}