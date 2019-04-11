import { findNearest, Distance, orderByDistance, getDistance } from 'geolib';
import { raioDeBusca } from '../common/database.config';


/**
 * retorna o objeto no array mais próximo do centro indicado
 * @param centro 
 * @param lista 
 */
export function OMaisPertoDe ( centro, lista: any[] ) {

    let areaDeBusca = new Array();

    for ( let index = 0; index < lista.length; index++ ) {
        areaDeBusca.push( lista[ index ].LOCALIZACAO );
    }

    let result = findNearest( centro, areaDeBusca );

    if ( result != undefined ) {
        let distanceInfo: Distance = JSON.parse( JSON.stringify( result ) );
        let key = Number( distanceInfo.key );
        return lista[ key ];
    } else {
        return undefined;
    }

}





/**
 * Retorna uma lista em ordem crescente com os objetos mais próximos ao centro indicado
 * @param centro 
 * @param historicoLista 
 */
export function VeiculosProximos ( rotulo, centro, historicoLista: any[] ) {
    let areaDeBusca = new Array();

    for ( let index = 0; index < historicoLista.length; index++ ) {
        areaDeBusca.push( historicoLista[ index ].LOCALIZACAO );
    }

    let result = orderByDistance( centro, areaDeBusca );
    let listaOrdenada = new Array();

    let distancia = 0;
    let index = 0;
    while ( distancia < raioDeBusca ) {
        if ( result[ index ].distance < raioDeBusca ) {
            let key = result[ index ].key;
            if ( historicoLista[ key ].ROTULO == rotulo ) {
                listaOrdenada.push( historicoLista[ key ] );
            }
        }
        if ( distancia == 0 ) {
            break;
        }
        distancia = result[ index ].distance;
        index++;
    }
    return listaOrdenada;
}


/**
 * retorna a distancia entre os dois pontos
 * @param ponto1 
 * @param ponto2 
 */
export function getDistancia ( ponto1, ponto2 ) {
    return getDistance( ponto1, ponto2 );
}
