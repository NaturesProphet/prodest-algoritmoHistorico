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
    const horaInicio: number = new Date().getTime();

    let viagensBanco = await getTable( 'viagem' );

    let dicionarioPontos = await geraPontos();

    let sequenciaPontos = await geraSequenciaDePontosPorItinerario();

    let estimativas = new Array();

    let dicionarioHistorico24 = await geraHistoricoPorRotulo();

    let viagensSemInfo = 0;
    let viagensSemInfoLog = new Array();
    let faixasDeHorarioNaoIdentificadas = 0;
    let faixasDeHorarioNaoIdentificadasLog = new Array();



    console.log( '\n\n\Algoritmo executando... aguarde.\n' );
    for ( let viagemIndex = 0; viagemIndex < viagensBanco.length; viagemIndex++ ) {
        //for ( let viagemIndex = 0; viagemIndex < 100; viagemIndex++ ) {
        let viagem: Viagem = new Viagem();
        viagem.id_viagem = viagensBanco[ viagemIndex ].id;
        viagem.rotulo = viagensBanco[ viagemIndex ].veiculo;
        viagem.data_i = new Date( viagensBanco[ viagemIndex ].horadasaida ).getTime();
        viagem.data_f = new Date( viagensBanco[ viagemIndex ].horadachegada ).getTime();
        viagem.itinerario_id = viagensBanco[ viagemIndex ].itinerario_id;

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
                    calculaFaixa( viagem.data_i, viagem.data_f,
                        pontoInicial, pontoFinal, historico );

                if ( faixaHorario == undefined ) {
                    faixasDeHorarioNaoIdentificadas++;
                    faixasDeHorarioNaoIdentificadasLog.push( {
                        viagemId: viagem.id_viagem,
                        rotulo: viagem.rotulo,
                        itinerarioId: itinerarioId
                    } );
                } else {
                    for ( let listaIndex = 0; listaIndex < listaPontosItinerario.length; listaIndex++ ) {

                        let historico = new Historico();
                        historico.ordem = listaPontosItinerario[ listaIndex ].ordem;
                        historico.ponto_id = listaPontosItinerario[ listaIndex ].ponto_id;

                        let coordenadasDoPonto: number[] = dicionarioPontos[ listaPontosItinerario[ listaIndex ].ponto_id ];

                        let horaNoPonto = getHorario
                            ( coordenadasDoPonto, faixaHorario, dicionarioHistorico24[ viagem.rotulo ] );

                        historico.data_hora = horaNoPonto;
                        viagem.historico.push( historico );
                    }
                }
            }
        }
        else {
            viagensSemInfo++;
            viagensSemInfoLog.push( {
                viagemId: viagem.id_viagem,
                rotulo: viagem.rotulo,
                itinerarioId: itinerarioId
            } );
        }

        if ( viagem.historico.length != 0 ) {
            estimativas.push( viagem );
        }
        //console.log( viagem.id_viagem );
    }
    const horaFinal: number = new Date().getTime();
    const tempo: number = ( ( horaFinal - horaInicio ) / 1000 ) / 60;

    console.log( 'Escrevendo o resultado no arquivo <estimativas.json> ...' );
    await fs.writeFileSync( 'estimativas.json', JSON.stringify( estimativas, null, 2 ) );
    await fs.writeFileSync( './logs/viagensSemInfoPontos.json', JSON.stringify( viagensSemInfoLog, null, 2 ) );
    await fs.writeFileSync( './logs/viagensSemFaixaHorario.json', JSON.stringify( faixasDeHorarioNaoIdentificadasLog, null, 2 ) );
    console.log( '\nAlgoritmo concluído. arquivo <estimativas.json> gerado.\n' );
    console.log( `Viagens sem relação de pontos (não processadas): ${viagensSemInfo}` );
    console.log( `Viagens com faixa de horarios não identificadas: ${faixasDeHorarioNaoIdentificadas}` );
    console.log( `Total de viagens: ${viagensBanco.length - 1}` );
    let ratio = ( ( estimativas.length / viagensBanco.length ) * 100 ).toString();
    console.log( `Taxa de sucesso do algoritmo com os dados atuais: ${parseFloat( ratio ).toFixed( 2 )}%` );
    console.log( `Tempo Total de execução: ${tempo} minutos` );
    const run = {
        tempoDeExecucao: `${tempo} minutos`,
        viagensProcessadas: viagensBanco.length - 1,
        estimativasGeradas: estimativas.length - 1,
        sucesso: `${parseFloat( ratio ).toFixed( 2 )}%`
    }
    await fs.writeFileSync( './logs/resultado.json', JSON.stringify( run, null, 2 ) );

}


main();