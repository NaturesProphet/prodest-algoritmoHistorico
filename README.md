# FONTE DE DADOS
-----------------------------
=============================
Viagens: tabela do banco estatico

id_viagem           # viagem.id
rotulo              # viagem.veiculo
data_i              # viagem.horadasaida
data_f              # viagem.horadachegada
itinerario_id       # viagem.itinerario.id
------------------------------
==============================
Historico: mongodb -> realtime/historico/veiculos
pontos - tabela do banco estatico
itinerario_ponto - tabela do banco estatico

ponto_id            # itinerario_ponto.ponto_id
ordem               # itinerario_ponto.ordem
data_hora           # historico.DATAHORA
------------------------------
==============================

# ALGORITMO

---------------------------------------------------------------------------------------
        ######################### 1. INICIALIZAÇÃO #########################

        # 1.1 Iniciar gerando um dicionario hash para a tabela viagens
    usando o id da tabelas como chave e seu conteúdo como valor.

        # 1.2 Gerar um dicionario hash para os pontos, usando seus IDs como chave,
    gerando um array [LONG,LAT] com suas coordenadas e usando esse array como valor.

        # 1.3 Receber todo o conteúdo da tabela itinerario_ponto em um array.

        # 1.4 Instanciar um dicionário hash para itinerario_ponto, usando
    itinerario_id como chave, e um array da estrutura de itinerario_ponto como valor.

        # 1.5 Varrer o array do passo 1.3, populando o dicionario do passo 1.4.


---------------------------------------------------------------------------------------
        ######################### 2. EXECUÇÃO #########################

        # 2.1 Instanciar o array principal para armazenar o resultado final.

        # 2.2.1 Executar um laço FOR para percorrer todos os dados do dicionario de viagens.

        # 2.2.1 Para cada registro, instanciar um objeto Viagem ( models/viagem.model ).

        # 2.2.2 Para cada objeto Viagem, instanciar um novo array do
    objeto Historico ( models/historico.model ) e atribuir este array ao campo historico
    do objeto Viagem.

        # 2.2.3 Ler o array de itinerario_ponto no dicionario do passo 1.4,
    usando como chave o valor de itinerario_id do objeto do passo 2.2.1

        # 2.2.3.1 Executar um sub-laço FOR para percorrer o array do passo 2.2.3

        # 2.2.3.2 Instanciar um novo Objeto Historico ( models/historico.model ), usando
    os valores de ponto_id e ordem do objeto do array do passo 2.2.3 da iteração atual.

        # 2.2.3.3 Ler as coordenadas do ponto_id atual no dicionario do passo 1.2

        # 2.2.3.4 Ler do banco de historico o DATAHORA mais próximo do ponto
    dentro da faixa de horario da viagem com uma margem de 50 %

        # 2.2.3.5 Atribuir este DATAHORA ao campo data_hora do objeto do passo 2.2.3.2

        # 2.2.3.6 adiconar o Objeto 2.2.3.2 ao array 2.1

        # 2.2.4 fim do sub-laço

        # 2.2 fim do laço principal.

        # 2.3 retornar o array principal e salvar em arquivo.
