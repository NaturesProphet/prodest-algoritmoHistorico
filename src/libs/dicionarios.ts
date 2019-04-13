/*
*                                                           *
*   Funções para gerar e popular os dicionários de dados    *
*                                                           *
*/

import { getTable } from "../database/estatico/sql-server";
import { getHistorico, getConnection } from "../database/realtime/mongodb";
import { MongoClient } from "mongodb";

async function geraPontos (): Promise<any> {

    console.log( 'Carregando o dicionário de pontos....' );

    let dicionario = new Object();
    let listaBruta = await getTable( 'ponto' );

    listaBruta.forEach( ponto => {

        let LOCALIZACAO = {
            latitude: Number( ponto.latitude ),
            longitude: Number( ponto.longitude )
        };
        dicionario[ Number( ponto.id ) ] = LOCALIZACAO;

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



async function geraHistoricoPorRotulo () {

    const mongo: MongoClient = await getConnection();
    console.log( 'Recebendo o histórico do mongoDB 24 hrs....' );
    let listaBruta = await getHistorico( mongo );
    let registros = listaBruta.length;
    mongo.close();
    console.log( 'Query OK! MongoDB desconectado.\n' );

    console.log( 'Gerando o dicionário de histórico por rotulo...' );
    let dicionario = new Object();
    let rotulos = 0;

    while ( listaBruta.length != 0 ) {
        let doc = listaBruta.pop();
        let rotulo = doc.ROTULO;
        if ( dicionario[ rotulo ] == undefined ) {
            rotulos++;
            let lista = new Array();
            lista.push( {
                ROTULO: doc.ROTULO,
                DATAHORA: doc.DATAHORA - 10800000, //utc-3
                LOCALIZACAO: {
                    latitude: Number( doc.LOCALIZACAO[ 1 ] ),
                    longitude: Number( doc.LOCALIZACAO[ 0 ] )
                }
            } )
            dicionario[ rotulo ] = lista;
        } else {
            dicionario[ rotulo ].push( {
                ROTULO: doc.ROTULO,
                DATAHORA: doc.DATAHORA - 10800000, //utc-3
                LOCALIZACAO: {
                    latitude: Number( doc.LOCALIZACAO[ 1 ] ),
                    longitude: Number( doc.LOCALIZACAO[ 0 ] )
                }
            } )
        }
    }
    console.log( `Dicionário de histórico gerado com ${rotulos} rotulos.` );
    console.log( `Total de registros de histórico processados no dicionário: ${registros}\n` );
    return dicionario;

}





















export { geraPontos, geraSequenciaDePontosPorItinerario, geraHistoricoPorRotulo };