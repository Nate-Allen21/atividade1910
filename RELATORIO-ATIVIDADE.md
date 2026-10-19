# Relatório — Atividade prática Aula 16

## Identificação

- Integrantes: preencher com os nomes da dupla/trio.
- API: Mini Chamados — `http://localhost:3333`.
- Rota principal: `GET /api/chamados`.
- Resposta esperada: JSON com a lista de chamados.
- Sucesso: HTTP `200`.

## Configuração do teste

O plano [jmeter/plano-inicial.jmx](jmeter/plano-inicial.jmx) contém Thread Groups, requisição HTTP, asserção de código HTTP 200, Summary Report e Aggregate Report. Os três cenários estão configurados com 10 repetições por usuário. Para executar um cenário, deixe o Thread Group correspondente habilitado e desabilite os outros dois.

| Cenário | Usuários | Ramp-up | Repetições |
|---|---:|---:|---:|
| Teste 1 | 1 | 1 s | 10 |
| Teste 2 | 10 | 10 s | 10 |
| Teste 3 | 20 | 10 s | 10 |

## Resultados

Os números abaixo foram medidos localmente com a API ligada. A planilha completa está em [resultados/planilha-resultados.csv](resultados/planilha-resultados.csv).

| Cenário | Amostras | Média | P90 | Máximo | Erros | Vazão | Resultado |
|---|---:|---:|---:|---:|---:|---:|---|
| Teste 1 — 1 usuário | 10 | 35 ms | 35 ms | 85 ms | 0% | 28,2 req/s | Atende |
| Teste 2 — 10 usuários | 100 | 26 ms | 34 ms | 68 ms | 0% | 10,8 req/s | Atende |
| Teste 3 — 20 usuários | 200 | 26 ms | 34 ms | 85 ms | 0% | 20,4 req/s | Atende |

### Respostas às questões

1. O tempo não aumentou com o crescimento da concorrência na rota `/api/chamados`; permaneceu baixo e estável. Isso ocorre porque essa rota faz apenas uma espera aleatória curta e consulta uma lista em memória.
2. O Teste 2 e o Teste 3 empataram na menor média, com 26 ms. Considerando também P90 e máximo, o Teste 2 teve o menor máximo (68 ms), portanto apresentou o melhor equilíbrio.
3. Não houve erros: todas as respostas foram HTTP 200 e a taxa de erro foi 0% nos três cenários.
4. Sim. A rota atendeu aos requisitos da atividade: média até 500 ms, erro 0% e resposta HTTP correta.
5. Teste de carga verifica o comportamento sob uma carga esperada; teste de estresse aumenta a carga além do uso normal até encontrar o limite; teste de pico aplica uma subida brusca de usuários para observar a reação e a recuperação do sistema.
6. Para aumentar a capacidade, poderiam ser usados banco de dados e pool de conexões dimensionados, cache para consultas repetidas, paginação, índices, compressão, observabilidade e escalabilidade horizontal. Em produção também seria importante limitar e controlar filas de requisições.

## Desafio extra

Foi escolhida a rota `GET /api/relatorio`.

| Usuários | Média | P90 | Máximo | Erros | Vazão |
|---:|---:|---:|---:|---:|---:|
| 1 | 153 ms | 152 ms | 185 ms | 0% | 6,5 req/s |
| 20 | 475 ms | 562 ms | 605 ms | 0% | 14,8 req/s |

Houve aumento significativo: a média cresceu 210% e o P90 chegou a 562 ms. Não houve falhas HTTP, mas a latência ficou próxima/acima do limite de referência quando observada no percentil. A melhoria prioritária é evitar o processamento repetido de todos os chamados a cada requisição, usando agregação/cache e consulta indexada no banco.

## Conclusão

A rota principal `/api/chamados` atende ao requisito de desempenho nos três níveis testados. A rota `/api/relatorio` é o ponto de atenção: continua sem erros, porém degrada com concorrência por causa do atraso proporcional ao número de requisições ativas. A recomendação é otimizar a geração do relatório e repetir o teste após a mudança.

## Capturas de tela para a entrega

Com a API ligada, abra `http://localhost:3333` no navegador e mantenha o painel visível durante a execução. No JMeter, abra o arquivo `.jmx` e capture:

1. a árvore do plano mostrando os três Thread Groups e os relatórios;
2. as propriedades do Thread Group do cenário executado;
3. a requisição `GET /api/chamados` e a Response Assertion `200`;
4. o Summary Report ao final de cada cenário;
5. o Aggregate Report ao final de cada cenário;
6. para o desafio, repita as telas usando `GET /api/relatorio`.

O agente não consegue conceder controle remoto do seu dispositivo nem tirar capturas da sua área de trabalho. As telas ficam prontas com os arquivos e os endereços acima; basta abrir o JMeter e o navegador localmente para capturá-las.

## Evidências capturadas no JMeter

Os prints realizados mostram:

- `GET /api/chamados` configurado com protocolo `http`, servidor `localhost` e porta `3333`;
- Thread Group do Teste 1 com 1 usuário, ramp-up de 1 segundo e 10 repetições;
- Summary Report e Aggregate Report sem erros;
- execução do cenário com 20 usuários, média de 21 ms, P90 de 31 ms, máximo de 46 ms e erro de 0%.

**Atenção:** o print do cenário de 20 usuários mostra 20 amostras, portanto aquela execução corresponde a 1 repetição por usuário. Para representar corretamente o Teste 3 da atividade, que exige 10 repetições por usuário, é necessário repetir a execução até o relatório mostrar 200 amostras. As capturas devem ser anexadas junto com este relatório, pois imagens coladas no chat não são automaticamente incorporadas ao arquivo Markdown.

### Anexos das capturas

![Configuração do Teste 1](<entrega-atividade/prints/01-teste-1-configuracao-thread-group.png>)

![Requisição GET /api/chamados](<entrega-atividade/prints/02-teste-1-requisicao-get-chamados.png>)

![Summary Report do Teste 1](<entrega-atividade/prints/03-teste-1-summary-report.png>)

![Aggregate Report do Teste 1](<entrega-atividade/prints/04-teste-1-aggregate-report.png>)

![Requisição do Teste 2](<entrega-atividade/prints/05-teste-2-requisicao-get-chamados.png>)

![Summary Report do Teste 2](<entrega-atividade/prints/06-teste-2-summary-report.png>)

![Requisição do Teste 3](<entrega-atividade/prints/07-teste-3-requisicao-get-chamados.png>)

![Summary Report do Teste 3](<entrega-atividade/prints/08-teste-3-summary-report.png>)
