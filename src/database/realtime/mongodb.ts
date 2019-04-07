/*
*                                                                   *
*   Funções para consultar o banco de dados de historico MongoDB    *
*                                                                   *
*/

import { mongoConnectionString, mongoSchema } from "../../common/database.config";
import { connect, MongoClient } from 'mongodb';


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
                        $maxDistance: 1
                    }
                }
            }
        ).toArray();
    } catch ( erro ) {
        console.log( `Erro ao fazer uma busca geo-espacial no mongoDB.\n${erro.message}` );
        process.exit( 1 );
    }
}
