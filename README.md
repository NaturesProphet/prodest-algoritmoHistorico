# Algoritmo Histórico do Realtime
Algoritmo desenvolvido para gerar estimativas sobre os horarios em que cada ônibus passa em cada ponto durante cada uma das viagens de seu itinerario. Alimentado por dados do banco estático em sql-server e do banco de histórico de 24 horas do sistema realtime em MongoDB.

## Variaveis de ambiente
```bash
TRANSCOLDB_USER
TRANSCOLDB_PASSWORD
TRANSCOLDB_HOST
TRANSCOLDB_SCHEMA
TRANSCOLDB_PORT
MONGO_HOST
MONGO_PORT
MONGO_USER
MONGO_PASSWORD
MONGO_SCHEMA
```

## Executar
Direto:
```bash
npm start                                       # roda direto em typescript via ts-node
```
via node call (compilar o typescript e chamar o main.js)
```bash
npm run prestart:prod                           # Compila o js
node dist/main.js                               # executa o js compilado
```

## FONTE DE DADOS

Viagens ---> tabela do banco estatico
```
id_viagem           # viagem.id
rotulo              # viagem.veiculo
data_i              # viagem.horadasaida
data_f              # viagem.horadachegada
itinerario_id       # viagem.itinerario.id
```
---

Historico: mongodb ---> realtime/historico/veiculos

pontos ---> tabela do banco estatico

itinerario_ponto ---> tabela do banco estatico
```
ponto_id            # itinerario_ponto.ponto_id
ordem               # itinerario_ponto.ordem
data_hora           # historico.DATAHORA
```
---

## ALGORITMO

1. INICIALIZAÇÃO

        1.1 Receber um Array de Viagens do banco estático

        1.2 Gerar um dicionario hash para os pontos, usando seus IDs como chave, gerando um array [ LONG, LAT ] com suas coordenadas e usando esse array como valor.

        1.3 Receber todo o conteúdo da tabela itinerario_ponto em um array.

        1.4 Instanciar um dicionário hash para itinerario_ponto, usando itinerario_id como chave, e um array da estrutura de itinerario_ponto como valor.

        1.5 Varrer o array do passo 1.3, populando o dicionario do passo 1.4.

---
2. EXECUÇÃO 

        2.1 Instanciar o array principal para armazenar o resultado final.

        2.2.0 Executar um laço FOR para percorrer todos os dados do array de viagens.

        2.2.1 Para cada registro, instanciar um objeto Viagem ( models/viagem.model ) e atribuir os valores da viagem atual na iteração

        2.2.2 Para cada objeto Viagem, instanciar um novo array do objeto Historico ( models/historico.model ) e atribuir este array ao campo historico do objeto Viagem.


        2.2.3 Ler o array de itinerario_ponto no dicionario do passo 1.4, usando como chave o valor de itinerario_id do objeto do passo 2.2.1

        2.2.3.a Para cada viagem, rodar o sub algoritmo "faixa" para definir a faixa de horario real da viagem, usando os horarios planejados e o array 2.2.3

        2.2.3.1 Executar um sub-laço FOR para percorrer o array do passo 2.2.3

        2.2.3.2 Instanciar um novo Objeto Historico ( models/historico.model ), usando os valores de ponto_id e ordem do objeto do array do passo 2.2.3 da iteração atual.

        2.2.3.3 Ler as coordenadas do ponto_id atual no dicionario do passo 1.2

        2.2.3.4 Ler do banco de historico o DATAHORA mais próximo do ponto dentro da faixa de horario da viagem.

        2.2.3.5 Atribuir este DATAHORA ao campo data_hora do objeto do passo 2.2.3.2

        2.2.3.6 adiconar o Objeto 2.2.3.2 ao array 2.1

        2.2.4 fim do sub-laço

        2.2 fim do laço principal.

        2.3 retornar o array principal e salvar em arquivo.


3. SUB ALGORITMO "faixa"

No passo 2.2.3.4 é necessário saber horarios iniciais e finais reais da viagem, para que não seja adicionado lixo de outras viagens no json. Este sub algoritmo resolve o caso:

        s1.1 Ler os valores da hora inicial e final planejada para a viagem no objeto 2.2.1

        s1.2 Estabelecer um intervalo de tempo equivalente a 50% da duração da viagem

        s1.3 Estabelecer um espaço de tempo com o intervalo do passo s1.2 para baixo e para cima do datahora inicial previsto

        s1.4 Buscar no historico o momento em que o veículo da viagem 2.2.1 apareceu mais próximo ao primeiro ponto da ordem no array ordenado s1.0

        s1.5 repetir os procedimentos s1.3 e s1.4 para o ultimo ponto do array s1.0

        s1.6 definir o intervalo de duração da viagem com s1.5 - s1.4