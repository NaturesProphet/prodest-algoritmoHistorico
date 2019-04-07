import { geraPontos, geraPontosPorItinerario } from "./libs/dicionarios";
import { getTable } from "./database/estatico/sql-server";
import { Viagem } from "./models/viagem.model";
import { Historico } from "./models/historico.model";
import { getConnection } from "./database/realtime/mongodb";
import { MongoClient } from "mongodb";
import { calculaFaixa } from "./libs/faixa";
const fs = require( 'fs' );




async function main () {
    // 1.1
    let viagensBanco = await getTable( 'viagem' );
    // 1.2
    let dicionarioPontos = await geraPontos();
    // 1.3 + 1.4 + 1.5
    let dicionarioItinerario = await geraPontosPorItinerario();
    // 2.1
    let estimativas = new Array();

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
        let listaPontosItinerario = dicionarioItinerario[ viagensBanco[ viagemIndex ].id ];

        if ( listaPontosItinerario != undefined ) {

            // pequeno truque para ordenar os objetos por ordem crescente de pontos de parada
            listaPontosItinerario.sort( function ( a, b ) {
                if ( a.ordem > b.ordem ) {
                    return 1;
                }
                if ( a.ordem < b.ordem ) {
                    return -1;
                }
                return 0;
            } );

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



                //..
                //..
                //..
                //2.2.3.6
                viagem.historico.push( historico );
            }
        } //2.2.4

        //2.2.3.6
        estimativas.push( viagem );

    } //2.2

    // 2.3
    mongodb.close();
    console.log( 'MongoDB desconectado.' );
    console.log( 'Escrevendo o resultado no arquivo <estimativas.json> ...' );
    await fs.writeFileSync( 'estimativas.json', JSON.stringify( estimativas, null, 2 ) );
    console.log( '\nAlgoritmo concluído. arquivo <estimativas.json> gerado.\n' );
}


main();