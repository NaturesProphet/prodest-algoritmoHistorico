import { config as dotEnvConfig } from 'dotenv';
dotEnvConfig();

import { geraPontos, geraSequenciaDePontosPorItinerario, geraHistoricoPorRotulo } from "./libs/dicionarios";
import { getTable } from "./database/estatico/sql-server";
import { Viagem } from "./models/viagem.model";
import { Historico } from "./models/historico.model";
import { calculaFaixa, getHorario } from "./libs/faixa";


const fs = require( 'fs' );


async function main () {

    console.clear();

    let viagensBanco = await getTable( 'viagem' );

    let dicionarioPontos = await geraPontos();

    let sequenciaPontos = await geraSequenciaDePontosPorItinerario();

    let estimativas = new Array();

    let dicionarioHistorico24 = await geraHistoricoPorRotulo();

    let viagensSemInfo = 0;
    let rotulosNaoEncontrados = 0;



    console.log( '\n\n\Algoritmo executando... aguarde.\n' );
    for ( let viagemIndex = 0; viagemIndex < viagensBanco.length; viagemIndex++ ) {

        let viagem: Viagem = new Viagem();
        viagem.id_viagem = viagensBanco[ viagemIndex ].id;
        viagem.rotulo = viagensBanco[ viagemIndex ].veiculo;
        viagem.data_i = new Date( viagensBanco[ viagemIndex ].horadasaida ).getTime();
        viagem.data_f = new Date( viagensBanco[ viagemIndex ].horadachegada ).getTime();
        viagem.itinerario_id = viagensBanco[ viagemIndex ].id;

        viagem.historico = new Array();

        let itinerarioId = viagensBanco[ viagemIndex ].itinerario_id;
        let listaPontosItinerario = sequenciaPontos[ itinerarioId ];

        if ( listaPontosItinerario != undefined ) {

            // lendo as coordenadas dos pontos inicias e finais da viagem
            let pontoInicial = listaPontosItinerario[ 0 ].ponto_id;
            let pontoFinal = listaPontosItinerario[ listaPontosItinerario.length - 1 ].ponto_id;
            pontoInicial = dicionarioPontos[ pontoInicial ];
            pontoFinal = dicionarioPontos[ pontoFinal ];

            let historico = dicionarioHistorico24[ viagem.rotulo ];
            let faixaHorario: number[];

            if ( historico != null ) {
                faixaHorario =
                    calculaFaixa( viagem.rotulo, viagem.data_i, viagem.data_f,
                        pontoInicial, pontoFinal, historico );

                for ( let listaIndex = 0; listaIndex < listaPontosItinerario.length; listaIndex++ ) {

                    let historico = new Historico();
                    historico.ordem = listaPontosItinerario[ listaIndex ].ordem;
                    historico.ponto_id = listaPontosItinerario[ listaIndex ].ponto_id;

                    let coordenadasDoPonto: number[] = dicionarioPontos[ listaPontosItinerario[ listaIndex ].ponto_id ];

                    let horaNoPonto = getHorario
                        ( coordenadasDoPonto, viagem.rotulo, faixaHorario, dicionarioHistorico24[ viagem.rotulo ] );

                    historico.data_hora = horaNoPonto;

                    if ( horaNoPonto != 0 ) {

                        viagem.historico.push( historico );
                    }
                }
            } else {
                rotulosNaoEncontrados++;
            }

        }
        else {
            viagensSemInfo++;
        }

        if ( viagem.historico.length != 0 ) {
            //2.2.3.6
            estimativas.push( viagem );
        }
        console.log( viagem.id_viagem );
    }


    console.log( 'Escrevendo o resultado no arquivo <estimativas.json> ...' );
    await fs.writeFileSync( 'estimativas.json', JSON.stringify( estimativas, null, 2 ) );
    console.log( '\nAlgoritmo concluído. arquivo <estimativas.json> gerado.\n' );
    console.log( `Viagens sem relação de pontos (não processadas): ${viagensSemInfo}` );
    console.log( `Rotulos não processadas: ${rotulosNaoEncontrados}` );
    console.log( `Total de viagens: ${viagensBanco.length - 1}` );

}


main();