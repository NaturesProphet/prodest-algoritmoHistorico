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
    console.log( 'Coordenadas dos pontos carregadas.\n' );
    return dicionario;
}


async function geraPontosPorItinerario (): Promise<any> {
    console.log( 'Carregando o dicionário de pontos X itinerarios....' );
    let listaBruta = await getTable( 'itinerario_ponto' );
    let dicionario = new Object();

    for ( let index = 0; index < listaBruta.length; index++ ) {
        // inicia uma chave caso não exista ainda
        if ( dicionario[ listaBruta[ index ].itinerario_id ] == undefined ) {
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
    console.log( 'dicionário de pontos X itinerarios carregado.\n' );
    return dicionario;
}




export { geraPontos, geraPontosPorItinerario };