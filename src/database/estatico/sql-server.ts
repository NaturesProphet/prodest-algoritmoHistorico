/*
*                                                                   *
*   Funções para consultar o banco de dados estatico sql-server     *
*                                                                   *
*/

import * as sql from 'mssql';
import { mssqlConnectionString } from "../../common/database.config";

/**
 * Esta função busca os dados no banco estático conforme a tabela informada.
 * @param tabela nome da tabela
 */
export async function getTable ( tabela: string ): Promise<any> {
    try {
        await sql.connect( mssqlConnectionString );
        let result;
        let horarios: number[] = JornadaDeOntem();
        if ( tabela == 'viagem' ) {
            console.log( 'Carregando os dados de viagens do banco estático para a memória...' );

            result = await sql.query
                (
                    `select id, veiculo, itinerario_id, horadasaida, horadachegada from viagem ` +
                    `where dataregistro BETWEEN ${horarios[ 0 ]} AND ${horarios[ 1 ]}`
                );
        } else if ( tabela == 'ponto' ) {
            result = await sql.query`select id, longitude, latitude from ponto`;
        } else if ( tabela == 'itinerario_ponto' ) {
            result = await sql.query`select ordem, ponto_id, itinerario_id from itinerario_ponto`;
        } else {
            let msg = `A tabela ${tabela} informada não está programada nesta biblioteca.`;
            console.log( msg );
            process.exit( 1 );
        }
        await sql.close();
        if ( result.recordset != undefined ) {
            console.log( 'Viagens carregadas.\n' );
            return result.recordset;
        } else {
            let h1 = new Date( horarios[ 0 ] ).toISOString();
            let h2 = new Date( horarios[ 1 ] ).toISOString();
            let msg = `A busca não encontrou dados no banco estático entre as datas ` +
                `${h1} e ${h2} (Horario Local UTC-3)`;
            console.log( msg );
            process.exit( 1 );
        }
    } catch ( err ) {
        let msg = `Erro ao consultar o banco estático\n${err.message}`;
        console.log( msg );
        process.exit( 1 );
    }
}

/**
 * Retorna um array de 2 posições, onde a primeira é o valor em millis da 
 * "meia noite de ontem" e o segundo é o valor millis da "meia noite de hoje"
 */
export function JornadaDeOntem (): number[] {
    //return [ 1554854400000, 1554940800000 ]; // data do meu banco
    // gera o datahora UTC
    let ontem = new Date()
    // ajusta para UTC-3 (America/Sao Paulo)
    ontem.setHours( ontem.getHours() - 3 );
    // retrocede 1 dia
    ontem.setDate( ontem.getDate() - 1 );
    //ajusta para a 0 hora
    ontem.setUTCHours( 0 )
    ontem.setUTCMinutes( 0 )
    ontem.setUTCSeconds( 0 )
    ontem.setMilliseconds( 0 )
    // converte para millis
    let ontemMeiaNoite: number = ontem.getTime();
    let hojeMeiaNoite: number = ontemMeiaNoite + ( 1000 * 60 * 60 * 24 );
    return [ ontemMeiaNoite, hojeMeiaNoite ];
}
