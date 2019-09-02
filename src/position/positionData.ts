import Universe, { ID, APIAttributes, resolveSolo } from "../universe/universe";
import Position, { XMLPosition } from "./position";
import { Solo } from "../../typings/util";
import { XMLMilitaryPlayerPosition, MilitaryPosition } from "../player/player";
import { PositionType as PositionTypeEnum, PositionCategory } from "../constenum";

/**Parses XML Position root file to a Position array
 * @category positions
 */
export default function parseXml<T extends ID, C extends PositionCategory, K extends PositionTypeEnum>(encodedData: XMLPositionData<C, K>, universe: Universe<T>) {
    
    const array = resolveSolo(encodedData.player) as unknown as PositionInterface<C, K>[];

    return array.map(position => 

        new Position<T>({

            score: position.score,
            position: position.position,
            type: encodedData.type,
            ships: position.ships,
            id: position.id

        }, universe, encodedData.timestamp)

    ) as PositionType<T, C, K>[];

};

type PositionInterface<C extends PositionCategory, K extends PositionTypeEnum> = C extends PositionCategory.PLAYER ? K extends PositionTypeEnum.MILITARY ? XMLMilitaryPlayerPosition : XMLPosition : XMLPosition;

/**@ignore */
export type PositionType<T extends ID, C extends PositionCategory, K extends PositionTypeEnum> = PositionInterface<C, K> extends XMLMilitaryPlayerPosition ? MilitaryPosition<T> : Position<T>;

/**@ignore */
export interface XMLPositionData<C extends PositionCategory, K extends PositionTypeEnum> extends APIAttributes {

    category: C;
    type: K;
    player: Solo<PositionInterface<C, K>>;

};

