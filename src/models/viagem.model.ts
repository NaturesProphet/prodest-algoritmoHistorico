import { Historico } from "./historico.model";

export class Viagem {

    id_viagem: number;

    rotulo: string;

    data_i: number;

    data_f: number;

    itinerario_id: number;

    historico: Historico[];

}
