import { MongoClient } from "mongodb";
import { executeQuery } from "../database/realtime/mongodb";
import { findNearest, Distance } from 'geolib';

export async function calculaFaixa
    ( rotulo: string, data_i: number, data_f: number, p0: number[], pF: number[], mongo: MongoClient ) {
    // s1.2
    let intervalo = ( data_f - data_i ) / 2; // adição de metade do tempo de viagem previsto
    //s1.3
    let dataInicialMinima = data_i - intervalo;
    let dataInicialMaxima = data_i + intervalo;
    let dataFinalMinima = data_f - intervalo;
    let dataFinalmaxima = data_f + intervalo;


    //s1.4
    let horarioInicioBruto = await executeQuery( mongo, rotulo, p0 );
    let horarioInicioFiltrado = new Array();

    for ( let index = 0; index < horarioInicioBruto.length; index++ ) {
        let datahora = horarioInicioBruto[ index ].DATAHORA;
        if ( datahora > dataInicialMinima && datahora < dataInicialMaxima ) {
            horarioInicioFiltrado.push( horarioInicioBruto[ index ] );
        }
    }
    let HorarioInicialReal: number;
    let key: number = await SelecionaCoordenadaMaisProxima( p0, horarioInicioFiltrado );
    if ( key != undefined ) {
        HorarioInicialReal = horarioInicioFiltrado[ key ].DATAHORA;
    } else {
        // console.log( `O veículo ${rotulo} não foi encontrado dentro do intervalo inicial da viagem` );
    }


    //s1.5
    let horarioFinalBruto = await executeQuery( mongo, rotulo, pF );
    let horarioFinalFiltrado = new Array();

    for ( let index = 0; index < horarioFinalBruto.length; index++ ) {
        let datahora = horarioFinalBruto[ index ].DATAHORA;
        if ( datahora > dataFinalMinima && datahora < dataFinalmaxima ) {
            horarioFinalFiltrado.push( horarioFinalBruto[ index ] );
        }
    }
    let HorarioFinalReal: number;
    let key2: number = await SelecionaCoordenadaMaisProxima( pF, horarioFinalFiltrado );
    if ( key2 != undefined ) {
        HorarioFinalReal = horarioFinalFiltrado[ key2 ].DATAHORA;
    } else {
        //console.log( `O veículo ${rotulo} não foi encontrado dentro do intervalo final da viagem` );
    }
    if ( key != undefined && key2 != undefined ) {
        return [ HorarioInicialReal, HorarioFinalReal ];
    }
    return undefined;
}








/**
 * 
 * @param posicaoCentral Array [LONG,LAT] com as coordenadas do local central
 * @param Lista Array bruto que vem da query ao mongodb
 * @returns Objeto apontando o índice da lista onde está a posição mais próxima e a distãncia
 */
async function SelecionaCoordenadaMaisProxima ( posicaoCentral: number[], lista: any[] ) {

    /**
     * O modulo GeoLib trabalha com objetos no formato
     *  {
     *    latitude: float,
     *    longitude: float
     *  }
     * antes de usar, é necessário converter os dados para este formato.
     * referência: https://www.npmjs.com/package/geolib
     */


    /**
     * 
     * O argumento 'lista' é um objeto bruto que chega da query near executada no mongodb.
     * seu formato é parecido com este:
     * [
     *  {
     *    "LOCALIZACAO": 
     *      [
     *        -40.322700000000005,
     *        -20.350196666666665
     *      ],
     *    "DATAHORA": 1553469168000
     *  }, .... 
     * ]
     * 
    */

    const centro = {
        latitude: posicaoCentral[ 1 ],
        longitude: posicaoCentral[ 0 ]
    };

    let CoordenadasLatLongEquivalentes = [];

    for ( let indiceLista = 0; indiceLista < lista.length; indiceLista++ ) {

        let latlng = {
            latitude: lista[ indiceLista ].LOCALIZACAO[ 1 ],
            longitude: lista[ indiceLista ].LOCALIZACAO[ 0 ]
        };
        CoordenadasLatLongEquivalentes.push( latlng );
    }
    let objetoDistanciaInfo = findNearest( centro, CoordenadasLatLongEquivalentes );
    if ( objetoDistanciaInfo != undefined ) {
        let distanceInfo: Distance = JSON.parse( JSON.stringify( objetoDistanciaInfo ) );
        return Number( distanceInfo.key );
    } else {
        return undefined;
    }

}


export async function getHorario
    ( ponto: number[], rotulo: string, faixa: number[], mongo: MongoClient ) {
    if ( faixa == undefined ) {
        return 0;
    }
    let horarios = await executeQuery( mongo, rotulo, ponto );
    let horariosValidos = new Array();
    for ( let index = 0; index < horarios.length; index++ ) {
        let datahora = horarios[ index ].DATAHORA;
        if ( datahora > faixa[ 0 ] && datahora < faixa[ 1 ] ) {
            horariosValidos.push( horarios[ index ] );
        }
    }
    let Indexkey: number = await SelecionaCoordenadaMaisProxima( ponto, horariosValidos );
    if ( Indexkey != undefined ) {
        return horariosValidos[ Indexkey ].DATAHORA;
    } else {
        return 0;
    }
}