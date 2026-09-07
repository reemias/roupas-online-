# Insider Store

Frontend da **Insider Store**, uma loja virtual de roupas com foco em descoberta de produtos, apresentação de detalhes, seleção de variações, carrinho persistente e encaminhamento para pagamento. O projeto também inclui um **CMS administrativo** para acompanhar vendas, clientes e produtos.

> O objetivo deste README é explicar como o site funciona na prática: quais são seus objetivos, como o usuário navega, o que cada card representa, quais rotas existem e como o frontend se comunica com a API.

## 1. Objetivo do projeto

A aplicação foi construída para oferecer uma experiência de compra de roupas com navegação visual e filtragem de catálogo. O cliente pode explorar produtos, consultar informações de preço e avaliação, escolher cor, tamanho e quantidade, adicionar itens ao carrinho e iniciar o checkout.

O frontend também concentra as rotinas administrativas em uma área separada. O CMS permite visualizar indicadores de vendas, consultar clientes, gerenciar produtos, acompanhar pedidos e acessar configurações internas.

A aplicação é composta por duas experiências complementares:

| Área | Prefixo | Público | Finalidade |
| --- | --- | --- | --- |
| Loja | `/` | Clientes e visitantes | Exibir o catálogo e conduzir a compra. |
| CMS | `/cms` | Usuários administrativos autenticados | Operar catálogo, pedidos, usuários e indicadores. |

## 2. Como o site funciona

### 2.1 Fluxo de descoberta

Ao acessar a raiz (`/`), o visitante encontra a Home da loja. A página apresenta um banner rotativo, filtros de catálogo, ordenação e uma grade de produtos. As categorias exibidas no menu principal são carregadas da API, portanto o cabeçalho pode refletir a organização atual do catálogo.

O visitante pode pesquisar pelo campo de busca, abrir uma categoria ou subcategoria no menu, alterar filtros e ordenar os resultados. Cada alteração de filtro reinicia a consulta do catálogo. A Home busca os produtos em páginas de dez registros e carrega mais resultados conforme o usuário se aproxima do final da grade.

### 2.2 Fluxo de produto

Ao selecionar um produto, o usuário é direcionado para `/produto/:id`. A página consulta os dados do produto pelo identificador da URL e exibe galeria de imagens, descrição, preço, desconto, avaliação, estoque, marca, material e cuidados.

Antes de adicionar o item, o usuário precisa selecionar as variações disponíveis, como cor e tamanho. A quantidade é limitada pelo estoque informado pela API. Depois da inclusão, o drawer do carrinho é aberto automaticamente e oferece o caminho para continuar comprando ou acessar o carrinho completo.

A página de produto também apresenta produtos recomendados da mesma categoria e a área de comentários associada ao produto. Existe ainda uma ação de compra por WhatsApp, que monta uma mensagem com nome, preço, imagem e link do produto.

### 2.3 Fluxo de carrinho e pagamento

O carrinho é mantido pelo `CartContext` e persistido no `localStorage`. A combinação de produto, cor e tamanho identifica uma linha do carrinho. Se a mesma combinação for adicionada novamente, sua quantidade é incrementada.

Na rota `/carrinho`, o usuário pode alterar quantidades, remover itens e preencher seus dados de identificação. O formulário aplica máscaras para CPF e telefone e valida e-mail, CPF, telefone e nome completo antes do envio.

Ao confirmar o pedido, o frontend envia os itens, o total, os dados do cliente e a opção de sacola para a API. Quando a API retorna um `paymentLink`, o carrinho e os dados temporários do checkout são limpos e o navegador é redirecionado para o checkout externo da InfinitePay. O retorno previsto para a loja é `/payment-success`.

## 3. Cards do site

### 3.1 Card de produto da loja

O componente reutilizável `ProductCard` representa um produto em listas, como a Home e a seção de recomendações. O card inteiro funciona como link para a página de detalhes.

| Elemento | Comportamento |
| --- | --- |
| Imagem | Exibe a primeira imagem retornada para o produto. Caso não exista, usa um placeholder. |
| Nome | Apresenta o nome comercial do produto. |
| Selo `BEST SELLER` | É exibido quando `isBestSeller` é verdadeiro. |
| Selo de desconto | Mostra o percentual de desconto quando `discount` é maior que zero. |
| Preço | Exibe o preço original e o preço calculado com desconto quando aplicável. |
| Avaliação | Mostra estrelas e a quantidade de avaliações quando existe uma nota maior que zero. |
| Ação `COMPRA RÁPIDA` | É exibida visualmente no card e integra a affordance de compra rápida da interface. |
| Link | Leva para `/produto/:id`. |

O preço com desconto é calculado no frontend pela fórmula `preço × (1 - desconto / 100)`. O valor efetivamente enviado ao carrinho também é o valor já descontado.

### 3.2 Cards e blocos do dashboard

No CMS, o dashboard não usa o mesmo `ProductCard` da loja. Ele organiza informações operacionais em blocos de métricas e gráficos.

| Bloco | Informação apresentada |
| --- | --- |
| Vendas | Total vendido, ticket médio e quantidade de pedidos. |
| Série de vendas | Valores de vendas por dia nos últimos sete dias. |
| Status dos pedidos | Distribuição dos pedidos por status em gráfico de rosca. |
| Últimos pedidos | Lista resumida com status, cliente e valor. |
| Clientes | Total de clientes e quantidade de usuários verificados. |
| Perfil de clientes | Distribuição por verificação e gênero. |
| Produtos | Indicadores de catálogo, produtos mais visualizados e itens com estoque baixo. |

Esses dados são carregados em paralelo a partir das rotas administrativas da API. O dashboard calcula localmente métricas derivadas, como ticket médio, vendas diárias, produtos mais visualizados e produtos com estoque inferior a dez unidades.

## 4. Rotas da loja

As rotas públicas são definidas em `src/router.tsx`. O `Header`, o `CartDrawer` e os contextos de autenticação e carrinho ficam disponíveis ao redor das páginas da loja.

| Rota | Página | Descrição |
| --- | --- | --- |
| `/` | Home | Banner, catálogo, filtros, ordenação, carregamento incremental e avaliações institucionais. |
| `/produto/:id` | Detalhes do produto | Galeria, informações, variações, estoque, compra, recomendações e comentários. |
| `/carrinho` | Carrinho e checkout | Itens, quantidades, dados do cliente e criação do pedido. |
| `/busca` | Busca | Resultados derivados de texto, categoria e subcategoria enviados por query string. |
| `/login` | Login | Autenticação do cliente por e-mail e senha. |
| `/registrar` | Cadastro | Criação de uma nova conta de cliente. |
| `/payment-success` | Sucesso do pagamento | Página de retorno após o fluxo de pagamento externo. |
| `/perfil` | Perfil | Rota protegida com tela de perfil ainda em desenvolvimento. |

### Parâmetros usados na busca

O cabeçalho navega para `/busca` usando parâmetros de consulta. Os principais parâmetros são:

| Parâmetro | Exemplo | Uso |
| --- | --- | --- |
| `q` | `/busca?q=camiseta` | Busca textual digitada pelo usuário. |
| `categoria` | `/busca?categoria=masculino` | Filtra uma categoria. |
| `subcategoria` | `/busca?subcategoria=camisetas` | Filtra uma subcategoria. |

A Home usa filtros equivalentes na consulta de produtos: categoria, marca, gênero, tamanho, cor, preço mínimo, preço máximo, ordenação, página e limite.

## 5. Rotas do CMS

O CMS é selecionado em `src/App.tsx` quando o caminho começa com `/cms`. O roteador administrativo usa `basename="/cms"`, portanto os caminhos abaixo são acessados com o prefixo completo indicado.

| Rota completa | Tela | Acesso |
| --- | --- | --- |
| `/cms/login` | Login administrativo | Pública dentro do CMS. |
| `/cms/` | Redirecionamento | Redireciona para `/cms/dashboard`. |
| `/cms/dashboard` | Dashboard | Protegida. Exibe vendas, clientes e produtos. |
| `/cms/produtos/novo` | Produtos | Protegida. Área de criação ou operação de produtos. |
| `/cms/Pedidos` | Pedidos | Protegida. Consulta e acompanhamento de pedidos. |
| `/cms/Usuarios` | Usuários | Protegida. Consulta de clientes e usuários. |
| `/cms/Config` | Configurações | Protegida. Ajustes operacionais do CMS. |

As rotas protegidas passam pelo `ProtectedRoute` do CMS e exibem o cabeçalho administrativo somente depois da autenticação. A autenticação do CMS possui armazenamento próprio, separado do armazenamento da loja.

## 6. Estado global e persistência

A aplicação usa Context API para compartilhar estados que atravessam várias páginas.

| Contexto | Responsabilidade | Persistência |
| --- | --- | --- |
| `ThemeContext` | Fornecer o tema da aplicação. | Estado em memória. |
| `AuthContext` | Login, cadastro, logout, usuário atual e status de autenticação da loja. | `store:token` e `store:user` no `localStorage`. |
| `CartContext` | Itens, totais, drawer, inclusão, remoção e alteração de quantidade. | `cart` no `localStorage`. |
| `CommentsContext` | Estado relacionado aos comentários dos produtos. | Gerenciado pelo fluxo do componente. |

A função de requisição em `src/services/api.ts` adiciona automaticamente o token da loja quando ele existe, envia credenciais de sessão e remove os dados de autenticação quando a API retorna `401`.

## 7. Integração com a API

A URL base é definida em `src/types/api.ts`:

- Em desenvolvimento, as requisições usam `/api`.
- Em produção, as requisições usam `https://backend-insider.vercel.app/api`.

O serviço expõe métodos `GET`, `POST`, `PUT` e `DELETE`, serializa objetos para JSON e trata respostas de erro com a mensagem retornada pela API.

As operações mais relevantes observadas no frontend são:

| Endpoint | Consumidor | Finalidade |
| --- | --- | --- |
| `GET /categories` | Cabeçalho | Carregar categorias e subcategorias do menu. |
| `GET /products` | Home e recomendações | Listar produtos com filtros, ordenação e paginação. |
| `GET /products/:id` | Detalhes do produto | Carregar um produto específico. |
| `POST /auth/login` | Login da loja | Autenticar o cliente. |
| `POST /auth/register` | Cadastro da loja | Criar uma conta de cliente. |
| `POST /orders` | Carrinho | Criar o pedido e obter o link de pagamento. |
| `GET /admin/orders` | Dashboard | Carregar pedidos administrativos. |
| `GET /admin/users` | Dashboard | Carregar clientes administrativos. |
| `GET /admin/products` | Dashboard | Carregar produtos administrativos. |

Os tipos de produto, pedido, cliente e endereço estão centralizados em `src/types/api.ts`. Isso ajuda a manter o contrato usado pelas telas consistente com as respostas esperadas da API.

## 8. Estrutura principal do código

```text
src/
├── App.tsx                 # Decide entre loja pública e CMS
├── router.tsx              # Rotas da loja
├── Pages/                  # Páginas públicas da loja
├── Componentes/            # Cabeçalho, cards, carrinho, comentários e proteção
├── contexts/               # Autenticação, carrinho, tema e comentários
├── services/api.ts         # Cliente HTTP compartilhado
├── types/                  # Contratos TypeScript da aplicação
├── Img/                    # Imagens e logos usadas na interface
└── cms/
    ├── App.tsx             # Entrada do CMS
    ├── Router.tsx          # Rotas administrativas
    ├── Pages/              # Dashboard, produtos, pedidos, usuários e configurações
    └── components/         # Header, sidebar e proteção administrativa
```

Os estilos são organizados por componente ou página em arquivos CSS Module. Essa organização evita colisões de classe entre a loja e o CMS.

## 9. Tecnologias

| Tecnologia | Papel no projeto |
| --- | --- |
| React 19 | Construção da interface e composição dos componentes. |
| TypeScript | Tipagem de páginas, estados, produtos, pedidos e respostas da API. |
| Vite | Servidor de desenvolvimento e build de produção. |
| React Router | Navegação entre loja, detalhes, busca, checkout e CMS. |
| Context API | Compartilhamento de autenticação, carrinho, tema e comentários. |
| Chart.js e `react-chartjs-2` | Gráficos do dashboard administrativo. |
| Lucide React | Ícones da interface. |
| `react-helmet-async` | Metadados de página e compartilhamento. |

## 10. Como executar localmente

### Pré-requisitos

- Node.js compatível com a versão usada pelo projeto.
- npm, que acompanha o Node.js.
- A API disponível em `/api` via proxy de desenvolvimento ou em uma URL configurada para produção.

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Depois, abra a URL informada pelo Vite. A loja estará disponível na raiz e o CMS em `/cms`.

### Verificação de qualidade

```bash
npm run lint
npm run build
```

O comando `lint` executa o ESLint. O comando `build` verifica o TypeScript e gera os arquivos de produção com o Vite.

### Preview da build

```bash
npm run preview
```

## 11. Observações de manutenção

A rota de perfil da loja ainda renderiza uma mensagem provisória. Os links informativos do rodapé, como “Sobre nós”, “Blog” e políticas, estão presentes visualmente, mas alguns ainda usam destinos de placeholder.

A tela de produtos do CMS é acessada por `/cms/produtos/novo`, embora o nome da página seja mais abrangente do que apenas “novo”. Alterações futuras de nomenclatura devem atualizar simultaneamente o roteador, o menu administrativo e esta documentação.

O pagamento depende do `paymentLink` retornado pela API. O frontend não processa diretamente os dados financeiros; ele valida os dados básicos do checkout, cria o pedido e encaminha o cliente para o provedor externo.

## 12. Referências

[1]: https://react.dev/ "Documentação oficial do React"

[2]: https://vite.dev/ "Documentação oficial do Vite"

[3]: https://reactrouter.com/ "Documentação oficial do React Router"

[4]: https://www.chartjs.org/ "Documentação oficial do Chart.js"


## 13. Atualização da página de detalhes do produto

A página `/produto/:id` foi reconstruída para oferecer uma experiência de compra mais próxima de um editorial de moda e alinhada ao modelo visual de referência. O novo layout organiza o conteúdo em uma galeria de destaque e um painel de compra, com maior hierarquia para o produto, preço, variações e benefícios de entrega.

Entre as principais melhorias estão o cabeçalho compacto com navegação e busca expansível, breadcrumb, galeria com miniaturas verticais, imagem principal clicável com ampliação em lightbox, estado de favorito, seleção visual de cor e tamanho, controle de quantidade, indicação de estoque, compra rápida, link para o carrinho e contato por WhatsApp. O cálculo do desconto e a integração com `CartContext` continuam preservados, assim como a abertura automática do drawer após adicionar o produto.

Abaixo do bloco de compra, a página agora apresenta uma seção editorial de detalhes com descrição e ficha técnica, uma área de avaliações com nota consolidada e o componente de comentários existente, além de uma vitrine de produtos relacionados. O CSS Module foi refeito com uma escala visual própria, espaçamento responsivo, estados de interação e breakpoints para tablets e celulares. A galeria mantém o comportamento de ampliação individual para cada imagem e as miniaturas funcionam como navegação da imagem principal.

A alteração está concentrada em `src/Pages/Product/index.tsx` e `src/Pages/Product/Product.module.css`, sem alterar o contrato da API, os tipos do carrinho ou as rotas existentes.


## 14. Avaliações locais, testes e experiência mobile

A página de produto agora permite que visitantes adicionem avaliações com nota de uma a cinco estrelas e comentários sem depender exclusivamente de autenticação. As novas entradas são persistidas no `localStorage` por produto, usando as chaves `insider:reviews:<productId>` e `insider:comments:<productId>`, e permanecem disponíveis após recarregar a página. Quando existe usuário autenticado, o envio também tenta sincronizar a avaliação ou comentário com a API existente.

Foram adicionados testes automatizados com Vitest em `src/Pages/Product/productInteractions.test.ts`. A suíte valida o cálculo da origem do zoom conforme a posição do cursor, a limitação do zoom aos limites da imagem, a seleção de estrelas e a distribuição visual das faixas de avaliação. O comando `npm test` executa a suíte em modo não interativo.

No mobile, as miniaturas da galeria passaram a funcionar como carrossel horizontal com rolagem por toque, snap e scrollbar oculto. O controle de quantidade e o botão principal de compra ocupam linhas próprias para facilitar o toque, enquanto o zoom por hover é desativado em telas pequenas para evitar conflitos com gestos. O layout preserva a hierarquia do produto e mantém os benefícios de compra acessíveis durante a navegação.
