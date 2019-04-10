/*
*                                                           *
*   Funções para gerar e popular os dicionários de dados    *
*                                                           *
*/

import { getTable } from "../database/estatico/sql-server";

async function geraPontos (): Promise<any> {
    console.log( 'Carregando o dicionário de pontos....' );
    let dicionario = new Object();
    let listaBruta = await getTable( 'ponto' );

    listaBruta.forEach( ponto => {
        let local = [ Number( ponto.longitude ), Number( ponto.latitude ) ];
        dicionario[ Number( ponto.id ) ] = local;
    } );
    console.log( `Coordenadas de ${listaBruta.length - 1} pontos carregadas.\n` );
    return dicionario;
}


async function geraSequenciaDePontosPorItinerario (): Promise<any> {
    console.log( 'Carregando o dicionário de pontos X itinerarios....' );
    let listaBruta = await getTable( 'itinerario_ponto' );
    let dicionario = new Object();
    let itinerarios = 0;

    for ( let index = 0; index < listaBruta.length; index++ ) {
        // inicia uma chave caso não exista ainda
        let itinerarioId = listaBruta[ index ].itinerario_id;
        if ( dicionario[ itinerarioId ] == undefined ) {
            itinerarios++;
            let pontos = new Array();
            let ponto = {
                ordem: listaBruta[ index ].ordem,
                ponto_id: listaBruta[ index ].ponto_id
            };
            pontos.push( ponto );
            dicionario[ listaBruta[ index ].itinerario_id ] = pontos;
        } else {
            //adiciona o ponto ao array
            let ponto = {
                ordem: listaBruta[ index ].ordem,
                ponto_id: listaBruta[ index ].ponto_id
            };
            dicionario[ listaBruta[ index ].itinerario_id ].push( ponto );
        }
    }
    console.log( `Lista de sequência de pontos por itinerario carregada com ${itinerarios} itinerarios.\n` )
    return dicionario;
}




export { geraPontos, geraSequenciaDePontosPorItinerario };