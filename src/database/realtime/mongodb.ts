/*
*                                                                   *
*   Funções para consultar o banco de dados de historico MongoDB    *
*                                                                   *
*/

import { mongoConnectionString, mongoSchema } from "../../common/database.config";
import { connect, MongoClient, FindOneOptions } from 'mongodb';


export async function getConnection (): Promise<MongoClient> {
    try {
        console.log( 'Iniciando nova conexão ao mongoDB...' );
        let conn = await connect( mongoConnectionString, { useNewUrlParser: true } );
        console.log( 'Conectado ao mongoDB.' );
        return conn;
    } catch ( erro ) {
        console.log( `Falhou ao tentar se conectar ao mongoDB.\n${erro.message}` );
        process.exit( 1 );
    }
}


export async function executeQuery ( client: MongoClient, rotulo: string, ponto: number[] ) {
    // ponto = [ -40.312713, -20.343406 ];
    // rotulo = '12071';
    try {
        const col = client.db( mongoSchema ).collection( 'veiculos' );
        return await col.find(
            {
                ROTULO: rotulo,
                LOCALIZACAO:
                {
                    $near:
                    {
                        $geometry: { type: "Point", coordinates: ponto },
                        $minDistance: 0,
                        $maxDistance: 100
                    }
                }
            }
        ).toArray();
    } catch ( erro ) {
        console.log( `uma busca geo-espacial no mongoDB falhou.` );
    }
}


export async function getHistorico ( client: MongoClient ) {
    try {
        const col = client.db( mongoSchema ).collection( 'veiculos' );
        return await col.find( {}, {
            projection: {
                "ROTULO": 1, "_id": 0, "LOCALIZACAO": 1, "DATAHORA": 1
            }
        } ).toArray();
    } catch ( erro ) {
        console.log( `Erro ao buscar os dados no mongoDB\n${erro.message}` );
        process.exit( 1 );
    }
}
