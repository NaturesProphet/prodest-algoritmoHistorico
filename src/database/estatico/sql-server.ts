/*
*                                                                   *
*   Funções para consultar o banco de dados estatico sql-server     *
*                                                                   *
*/

import * as sql from 'mssql';
import { mssqlConnectionString } from "common/database.config";

/**
 * Esta função busca os dados no banco estático conforme a tabela informada.
 * @param tabela nome da tabela
 */
export async function getTable ( tabela: string ): Promise<any> {
    try {
        await sql.connect( mssqlConnectionString );
        let result;
        if ( tabela == 'viagem' ) {
            result = await sql.query`select id, veiculo, itinerario_id from viagem`;
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
        console.log( result.recordset )
        return result.recordset;
    } catch ( err ) {
        let msg = `Erro ao consultar o banco estático\n${err.message}`;
        console.log( msg );
        process.exit( 1 );
    }
}
