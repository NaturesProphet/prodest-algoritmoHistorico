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
    // ponto = [ -40.312713, -20.343406 ];
    // rotulo = '12071';
    try {
        const col = client.db( mongoSchema ).collection( 'veiculos' );
        let historia = await col.find(
            {
                ROTULO: rotulo,
                IGNICAO: true,
                LOCALIZACAO:
                {
                    $near:
                    {
                        $geometry: { type: "Point", coordinates: ponto },
                        $minDistance: 0,
                        $maxDistance: 100
                    }
                }
            }, { projection: { "_id": 0, "DATAHORA": 1, "LOCALIZACAO": 1, ROTULO: 1 } }
        ).toArray();
        for ( let index = 0; index < historia.length; index++ ) {
            historia[ index ].DATAHORA -= 10800000; // CONVERTE PARA UTC-3
        }
        return historia;
    } catch ( erro ) {
        console.log( `uma busca geo-espacial no mongoDB falhou.` );
    }
}
