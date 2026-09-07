# Insider Store

Frontend de uma loja virtual de roupas e calçados construído com React, TypeScript e Vite. O catálogo é alimentado por um arquivo Markdown versionado no repositório, e a aplicação executa a consulta, filtragem, ordenação e paginação dos produtos no navegador.

> **Estado atual:** a loja pública e o carrinho estão implementados. O catálogo é somente leitura. Autenticação, comentários remotos, criação de pedidos e pagamento dependem de um backend de escrita que não está conectado nesta versão.

## Visão geral

A aplicação oferece uma experiência de descoberta de produtos com banners, filtros, busca, detalhes de produto, seleção de variações, carrinho persistente, checkout com validação local, comentários salvos no navegador e contato de compra pelo WhatsApp.

| Área | Rota | Situação | Descrição |
| --- | --- | --- | --- |
| Home | `/` | Disponível | Banners, catálogo, filtros, ordenação e carregamento incremental. |
| Produto | `/produto/:id` | Disponível | Galeria, preço, desconto, variações, estoque, recomendações e avaliações. |
| Busca | `/busca` | Disponível | Busca textual e filtros por categoria e subcategoria. |
| Carrinho | `/carrinho` | Parcial | Carrinho e validação local disponíveis; criação do pedido requer backend. |
| Login | `/login` | Interface disponível | O envio requer backend de autenticação. |
| Cadastro | `/registrar` | Interface disponível | O envio requer backend de autenticação. |
| Retorno de pagamento | `/payment-success` | Disponível | Tela de retorno prevista para um provedor de pagamento externo. |
| Perfil | `/perfil` | Provisório | Rota protegida que exibe a mensagem “Página de perfil (em breve)”. |

Não existe um CMS frontend em `src`. Referências a `/cms`, dashboard administrativo, pedidos administrativos, clientes ou gerenciamento de produtos não fazem parte da aplicação atual.

## Fluxo de navegação

### Home e catálogo

A Home carrega os produtos pelo serviço `src/services/api.ts`. Esse serviço lê uma única vez o arquivo `public/catalog.md` por meio de `fetch('/catalog.md')`, extrai o bloco JSON e mantém os produtos em memória durante a sessão.

A tela exibe três banners rotativos e permite filtrar o catálogo por categoria, marca, gênero, tamanho, cor e faixa de preço. A grade utiliza páginas de dez produtos e carrega a próxima página quando o usuário se aproxima do final da lista.

As categorias apresentadas no cabeçalho são derivadas dos próprios produtos do Markdown. Isso evita uma segunda fonte de dados para categorias e subcategorias.

### Busca

A rota `/busca` aceita os seguintes parâmetros:

| Parâmetro | Exemplo | Função |
| --- | --- | --- |
| `q` | `/busca?q=camiseta` | Pesquisa no nome, descrição e marca do produto. |
| `categoria` | `/busca?categoria=Roupas` | Filtra pela categoria do catálogo. |
| `subcategoria` | `/busca?subcategoria=Camisas` | Filtra pela subcategoria do catálogo. |

Quando há uma consulta ativa, a tela carrega os resultados em páginas de oito itens. Depois dos resultados filtrados, ela pode apresentar recomendações adicionais do catálogo, evitando duplicidades.

### Detalhes do produto

A rota `/produto/:id` localiza o produto pelo campo `_id` no catálogo local. A tela apresenta:

- galeria de imagens e visualização ampliada;
- nome, marca, categoria, descrição e ficha técnica;
- preço original, desconto e preço calculado;
- seleção de cor, tamanho e quantidade;
- indicação de estoque;
- adição ao carrinho;
- produtos recomendados da mesma categoria;
- metadados SEO da página;
- compartilhamento de uma mensagem de compra pelo WhatsApp.

A quantidade adicionada é limitada ao estoque informado no catálogo. O preço usado no carrinho é o preço já calculado com desconto.

### Card e drawer do carrinho

O componente `ProductCard` é utilizado na Home, na busca e nas recomendações. Ele exibe a imagem, o nome, o preço, o desconto, a avaliação e o selo de mais vendido quando o produto possui `isBestSeller: true`.

Depois que um item é adicionado, o `CartContext` abre automaticamente o drawer lateral. O drawer permite revisar itens, alterar quantidades, remover produtos, limpar o carrinho, continuar comprando, acessar `/carrinho` e montar uma mensagem de pedido para o WhatsApp.

### Carrinho e checkout

O carrinho é armazenado em `localStorage` com a chave `cart`. Cada linha é identificada pela combinação de produto, cor e tamanho. Adicionar a mesma combinação novamente incrementa sua quantidade.

A rota `/carrinho` possui um formulário com:

- nome completo;
- e-mail;
- CPF com máscara;
- telefone com máscara;
- opção de sacola, que acrescenta R$ 5 ao total;
- persistência dos dados preenchidos em `localStorage` pela chave `checkoutForm`.

O formulário valida os dados localmente. Após a validação, ele ainda tenta chamar `POST /orders` por meio do serviço compartilhado. Como o serviço atual está em modo somente leitura, essa chamada retorna a mensagem de que a operação requer um backend. Nenhum pedido é salvo e nenhum link de pagamento é gerado nesta versão.

### Comentários e avaliações

A área de comentários é renderizada pelo componente `src/Componentes/Comments`. Comentários e avaliações criados sem usuário autenticado são salvos localmente por produto nas chaves:

- `insider:comments:<id-do-produto>`;
- `insider:reviews:<id-do-produto>`.

O usuário pode criar avaliações com nota, título e comentário, criar comentários e excluir registros locais. Quando existe usuário autenticado, o componente também tenta sincronizar as operações com o `CommentsContext`; essa sincronização depende de um backend de escrita e não está disponível no catálogo Markdown.

## Catálogo local em Markdown

O arquivo [`public/catalog.md`](public/catalog.md) é o banco de dados de leitura da loja. Ele contém texto explicativo em Markdown e um bloco cercado por ```` ```json ```` com o objeto:

```json
{
  "products": []
}
```

Cada produto deve manter os campos esperados pelo tipo `Product` em `src/types/api.ts`.

| Campo | Tipo | Uso |
| --- | --- | --- |
| `_id` | `string` | Identificador usado na URL do produto e no carrinho. Deve ser único. |
| `name` | `string` | Nome comercial exibido na interface. |
| `description` | `string` | Descrição e texto usado na busca. |
| `price` | `number` | Preço original em reais. |
| `discount` | `number` | Desconto percentual aplicado no frontend. |
| `category` | `string` | Categoria principal. |
| `subcategory` | `string` | Subcategoria usada na busca. |
| `brand` | `string` | Marca e filtro de marca. |
| `material` | `string` | Material exibido na ficha técnica. |
| `careInstructions` | `string` | Instruções de cuidado. |
| `gender` | `string` | Gênero usado pelo filtro da Home. |
| `sizes` | `string[]` | Variações de tamanho disponíveis. |
| `colors` | `string[]` | Variações de cor disponíveis. |
| `images` | `string[]` | URLs exibidas na galeria e nos cards. |
| `stock` | `number` | Estoque usado para limitar a quantidade. |
| `isActive` | `boolean` | Produtos com `false` são excluídos do catálogo carregado. |
| `rating` | `number` | Nota exibida no card e nos detalhes. |
| `numReviews` | `number` | Quantidade de avaliações exibida na interface. |
| `isBestSeller` | `boolean` | Controla o selo de mais vendido. |
| `views` e `sales` | `number` | Indicadores disponíveis no modelo para futuras ordenações ou métricas. |

### Comportamento do serviço local

`src/services/api.ts` preserva uma interface parecida com o antigo cliente de API para evitar acoplamento das páginas a uma implementação específica. Atualmente, apenas consultas de leitura são implementadas:

| Operação interna | Consumidores | Comportamento |
| --- | --- | --- |
| `GET /categories` | `Header` | Deriva categorias e subcategorias a partir dos produtos ativos. |
| `GET /products` | Home, busca e drawer | Aplica filtros, ordenação e paginação no navegador. |
| `GET /products/:id` | Detalhes do produto | Retorna o produto correspondente ao `_id`. |
| `POST`, `PUT`, `DELETE` | Autenticação, comentários remotos e checkout | Retornam um erro explicativo; não enviam dados para um backend. |

Os dados são carregados apenas uma vez por sessão de página, porque o serviço reutiliza a mesma `Promise` enquanto o catálogo está disponível. Se o carregamento ou o parsing falhar, a promessa é descartada para permitir uma nova tentativa.

## Estado e persistência

A aplicação usa Context API para compartilhar estados entre componentes.

| Contexto ou mecanismo | Responsabilidade | Persistência |
| --- | --- | --- |
| `AuthContext` | Usuário atual, login, cadastro e logout. | `store:token` e `store:user`. A autenticação requer backend. |
| `CartContext` | Itens, totais, drawer e operações do carrinho. | `cart`. |
| `CommentsContext` | Estado de comentários e avaliações remotos. | Estado em memória; registros locais são gerenciados pelo componente `Comments`. |
| `ThemeContext` | Tema visual da aplicação. | `theme`. |
| `checkoutForm` | Dados preenchidos no checkout. | `checkoutForm`. |

O `AuthContext` considera o usuário autenticado quando existem usuário e token no `localStorage`. O código ainda preserva a estrutura necessária para uma futura API de login, mas o cliente local não implementa `POST /auth/login` nem `POST /auth/register`.

## Estrutura do projeto

```text
.
├── public/
│   └── catalog.md                 # Banco de dados de leitura do catálogo
├── src/
│   ├── App.tsx                    # Entrada da aplicação
│   ├── router.tsx                 # BrowserRouter e rotas públicas
│   ├── Pages/
│   │   ├── Home/                  # Vitrine, filtros e carregamento incremental
│   │   ├── Product/               # Detalhes do produto
│   │   ├── Search/                # Busca e recomendações
│   │   ├── Cart/                  # Carrinho e checkout
│   │   ├── Login/                 # Tela de login
│   │   └── Register/              # Tela de cadastro
│   ├── Componentes/
│   │   ├── Header/                # Cabeçalho, busca e categorias
│   │   ├── SideMenu/              # Menu lateral e acesso à conta
│   │   ├── ProductCard/            # Card reutilizável de produto
│   │   ├── CartDrawer/             # Drawer do carrinho
│   │   ├── Comments/               # Comentários e avaliações locais/remotos
│   │   ├── PageMeta/               # Metadados SEO
│   │   ├── ImageWithLoader/         # Imagens com estado de carregamento
│   │   ├── LoadingSpinner/          # Estados de carregamento
│   │   └── PaymentSuccess.tsx       # Tela de retorno de pagamento
│   ├── contexts/                  # Autenticação, carrinho, comentários e tema
│   ├── hooks/useSearch.ts          # Consulta paginada da busca
│   ├── services/api.ts             # Repositório local do catálogo
│   ├── types/                     # Tipos de produto, pedido e usuário
│   ├── Img/                       # Banners, logos e imagens da interface
│   ├── index.css                  # Estilos globais
│   └── App.css                    # Estilos gerais da aplicação
├── api/preview.js                 # Handler auxiliar legado para preview social
├── email/                         # Serviço auxiliar independente de envio de e-mail
├── index.html                     # HTML inicial e metadados da Home
├── vite.config.ts                 # Plugins Vite, React e SVG
└── vercel.json                    # Rewrite de rotas SPA
```

Os estilos das páginas e componentes usam CSS Modules. O arquivo `src/Pages/Product/productInteractions.test.ts` contém testes unitários das interações da página de produto.

### Arquivos auxiliares fora do fluxo principal

`api/preview.js` é um handler legado para gerar HTML com metadados de compartilhamento quando um crawler acessa uma página de produto. Ele ainda tenta consultar `VITE_API_URL` e o endpoint externo antigo. Portanto, ele **não participa do carregamento do catálogo da SPA** e precisa ser atualizado separadamente se o preview social for mantido no deploy atual.

A pasta `email/` contém um serviço Node.js independente. Ele possui `sendEmail.js`, `template.html`, `.env` próprio e script `npm start`, utilizando o pacote `brevo`. Esse serviço não é importado pelo frontend nem é iniciado pelos scripts da raiz.

## Tecnologias e scripts

| Tecnologia ou script | Função |
| --- | --- |
| React 19 | Componentes e interface. |
| TypeScript | Tipagem e verificação de código. |
| Vite | Desenvolvimento e build de produção. |
| React Router | Rotas da loja. |
| Context API | Estado compartilhado. |
| CSS Modules | Estilos isolados por componente. |
| Lucide React | Ícones. |
| React Photo View | Ampliação das imagens do produto. |
| React Helmet Async | Metadados de páginas. |
| Vitest | Testes unitários. |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Executa `tsc -b` e gera a build de produção. |
| `npm run lint` | Executa o ESLint em todo o projeto. |
| `npm run test` | Executa os testes com Vitest. |
| `npm run preview` | Serve a build de produção localmente. |

## Como executar

### Pré-requisitos

- Node.js compatível com o projeto.
- npm.
- O arquivo `public/catalog.md` presente no repositório.

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abra a URL exibida pelo Vite. A aplicação pública começa na rota `/`.

### Build e preview

```bash
npm run build
npm run preview
```

O Vite copia `public/catalog.md` para a raiz da build. Assim, o serviço continua acessando o catálogo por `/catalog.md` em produção.

### Testes e lint

```bash
npm run test
npm run lint
```

O teste atualmente presente cobre funções de interação da página de produto. O lint é executado sobre todo o repositório; arquivos legados ou componentes que ainda contenham avisos podem impedir o comando de retornar sucesso.

## Deploy e configuração

`vercel.json` redireciona rotas sem extensão para `index.html`, permitindo que o `BrowserRouter` resolva as rotas da SPA. Arquivos estáticos, como `/catalog.md`, continuam sendo servidos diretamente.

O arquivo `.env` ainda contém as variáveis históricas `VITE_API_URL`, mas o serviço atual do catálogo **não as utiliza**. A URL do catálogo é fixa em `/catalog.md`. A variável só permanece relevante para o handler legado `api/preview.js`, caso esse handler seja utilizado no deploy.

Antes de publicar uma alteração de catálogo, valide o JSON embutido e execute uma build:

```bash
awk '/```json/{flag=1;next}/```/{if(flag){exit}}flag' public/catalog.md > /tmp/catalog.json
node -e "const c=require('/tmp/catalog.json'); console.log(c.products.length)"
npm run build
```

## Limitações conhecidas e próximos passos

A versão atual não possui persistência remota para autenticação, pedidos, pagamentos, comentários ou avaliações. O carrinho, o formulário de checkout e os comentários locais são persistidos apenas no navegador do usuário.

A rota `/perfil` ainda é um placeholder. A tela de retorno `/payment-success` existe, mas não é alcançada pelo fluxo atual porque nenhum link de pagamento é gerado no modo Markdown.

O menu lateral ainda contém links fixos para “Camisas”, “Calças” e “Bonés”. Como “Bonés” não está presente no catálogo povoado atualmente, esse link pode retornar uma busca sem produtos.

Para conectar um backend no futuro, a implementação deve definir uma fonte de escrita para autenticação, pedidos e comentários. O formato do produto em `public/catalog.md` pode continuar sendo usado como contrato inicial do catálogo.

## Referências

[1]: https://react.dev/ "Documentação oficial do React"

[2]: https://vite.dev/ "Documentação oficial do Vite"

[3]: https://reactrouter.com/ "Documentação oficial do React Router"

[4]: https://vitest.dev/ "Documentação oficial do Vitest"

[5]: https://vercel.com/docs "Documentação da Vercel"
