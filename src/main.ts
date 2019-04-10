import { config as dotEnvConfig } from 'dotenv';
dotEnvConfig();

import { geraPontos, geraSequenciaDePontosPorItinerario } from "./libs/dicionarios";
import { getTable } from "./database/estatico/sql-server";
import { Viagem } from "./models/viagem.model";
import { Historico } from "./models/historico.model";
import { getConnection } from "./database/realtime/mongodb";
import { MongoClient } from "mongodb";
import { calculaFaixa, getHorario } from "./libs/faixa";




const fs = require( 'fs' );




async function main () {
    // 1.1
    let viagensBanco = await getTable( 'viagem' );
    // 1.2
    let dicionarioPontos = await geraPontos();
    // 1.3 + 1.4 + 1.5
    let sequenciaPontos = await geraSequenciaDePontosPorItinerario();
    // 2.1
    let estimativas = new Array();

    let viagensSemInfo = 0;

    const mongodb: MongoClient = await getConnection();

    //2.2.0
    console.log( '\n\n\n\nAlgoritmo executando... aguarde.\n' );
    for ( let viagemIndex = 0; viagemIndex < viagensBanco.length; viagemIndex++ ) {
        //2.2.1
        let viagem: Viagem = new Viagem();
        viagem.id_viagem = viagensBanco[ viagemIndex ].id;
        viagem.rotulo = viagensBanco[ viagemIndex ].veiculo;
        viagem.data_i = new Date( viagensBanco[ viagemIndex ].horadasaida ).getTime();
        viagem.data_f = new Date( viagensBanco[ viagemIndex ].horadachegada ).getTime();
        viagem.itinerario_id = viagensBanco[ viagemIndex ].id;
        //2.2.2
        viagem.historico = new Array();
        //2.2.3
        let itinerarioId = viagensBanco[ viagemIndex ].itinerario_id;
        let listaPontosItinerario = sequenciaPontos[ itinerarioId ];

        if ( listaPontosItinerario != undefined ) {
            //2.2.3.a
            // lendo as coordenadas dos pontos inicias e finais da viagem
            let pontoInicial = listaPontosItinerario[ 0 ].ponto_id;
            let pontoFinal = listaPontosItinerario[ listaPontosItinerario.length - 1 ].ponto_id;
            pontoInicial = dicionarioPontos[ pontoInicial ];
            pontoFinal = dicionarioPontos[ pontoFinal ];

            let faixaHorario: number[] =
                await calculaFaixa( viagem.rotulo, viagem.data_i, viagem.data_f,
                    pontoInicial, pontoFinal, mongodb );


            //2.2.3.1
            for ( let listaIndex = 0; listaIndex < listaPontosItinerario.length; listaIndex++ ) {
                //2.2.3.2
                let historico = new Historico();
                historico.ordem = listaPontosItinerario[ listaIndex ].ordem;
                historico.ponto_id = listaPontosItinerario[ listaIndex ].ponto_id;
                //2.2.3.3
                let coordenadasDoPonto: number[] = dicionarioPontos[ listaPontosItinerario[ listaIndex ].ponto_id ];
                // 2.2.3.4
                let horaNoPonto = await getHorario
                    ( coordenadasDoPonto, viagem.rotulo, faixaHorario, mongodb );
                //2.2.3.5
                historico.data_hora = horaNoPonto;

                if ( horaNoPonto != 0 ) {
                    //2.2.3.6
                    viagem.historico.push( historico );
                }
            }
        } //2.2.4
        else {
            viagensSemInfo++;
        }

        if ( viagem.historico.length != 0 ) {
            //2.2.3.6
            estimativas.push( viagem );
        }

    } //2.2

    // 2.3
    mongodb.close();
    console.log( 'MongoDB desconectado.' );
    console.log( 'Escrevendo o resultado no arquivo <estimativas.json> ...' );
    await fs.writeFileSync( 'estimativas.json', JSON.stringify( estimativas, null, 2 ) );
    console.log( '\nAlgoritmo concluído. arquivo <estimativas.json> gerado.\n' );
    console.log( `Viagens sem relação de pontos (não processadas): ${viagensSemInfo}` );
    console.log( `Total de viagens: ${viagensBanco.length - 1}` );
}


main();