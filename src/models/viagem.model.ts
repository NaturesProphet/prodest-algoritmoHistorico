import { Historico } from "./historico.model";

export class Viagem {

    id_viagem: number;

    rotulo: string;

    bandeira: string;

    data_i: number;

    data_f: number;

    itinerario_id: number;

    itinerario_codigo: string;

    historico: Historico[];

}
