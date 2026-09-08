# AutoPrime Motors - Plataforma Web para Concessionária de Veículos

Plataforma completa, moderna e responsiva para concessionária de veículos com catálogo digital e painel administrativo integrado.

---

## 🚀 Arquitetura & Tecnologias

1. **Frontend**:
   - **React 18 & TypeScript**: Interface fluida, componentizada e reativa.
   - **Tailwind CSS**: Estilização moderna com paleta escura sofisticada (preto, cinza grafite, acentos dourados e esmeralda).
   - **Ícones SVG Puros**: Mais de 25 ícones vetoriais customizados criados em SVG com suporte a `currentColor`.
   - **Design Responsivo**: Adaptado para celulares, tablets e desktops (menu lateral móvel, grids dinâmicos).

2. **Back-end & Persistência**:
   - **Ambiente Ativo de Produção / Cloud Run**: Node.js + Express + SQLite nativo (`node:sqlite`) persistido no diretório `./data/dealership.sqlite`.
   - **C++17 Crow REST Backend**: Implementação completa em C++17 com framework Crow e SQLite3 na pasta `/backend/` (com `CMakeLists.txt` e `schema.sql`).
   - **Upload de Fotos**: Suporte a upload real de imagens com armazenamento local e pré-visualização.

---

## 🌟 Funcionalidades Implementadas

### 1. Catálogo Digital (Showroom)
- **Filtros Multifuncionais**: Marca, Categoria (SUV, Sedan, Cupê, etc.), Combustível, Câmbio, Condição (Novo / Seminovo), Preço Máximo, Apenas Ofertas e Veículos Disponíveis.
- **Busca Textual em Tempo Real**: Por marca, modelo e versão.
- **Ordenação Inteligente**: Menor preço, maior preço, menor quilometragem, ano mais recente.
- **Contador Dinâmico**: Exibição em tempo real da quantidade de veículos encontrados.
- **Estados Visuais de Estoque**: Badges para "Disponível", "Reservado", "Vendido", "Oferta" e "Destaque".

### 2. Detalhes do Veículo
- Galeria de fotos com foto principal em destaque, setas de navegação e miniaturas clicáveis.
- Especificações completas (Ano fabricação/modelo, Km, Câmbio, Combustível, Cor, Portas, Final de placa).
- Lista de opcionais e itens de série com ícones de verificação.
- **Simulador de Financiamento Interativo**: Ajuste percentual de entrada e seleção de 12x a 60x parcelas com cálculo estimado.
- Integração direta com o **WhatsApp** com mensagem pré-preenchida dinâmica.
- Modal de agendamento de visita e test-drive.
- Recomendações de veículos semelhantes em estoque.

### 3. Painel Administrativo do Proprietário (`#admin` ou botão no cabeçalho/rodapé)
- **Autenticação Segura**: Login com usuário e senha (`admin` / `admin123`).
- **Dashboard com Métricas**: Total em estoque, veículos disponíveis, vendidos, em oferta e leads aguardando atendimento.
- **Gestão de Estoque Completa**:
  - Cadastro de novos veículos com upload de fotos ou inclusão de links.
  - Edição de qualquer veículo existente.
  - Alteração de status com 1 clique (Disponível, Reservado, Vendido).
  - Alternância de destaques e ofertas na tabela.
  - Duplicação de anúncios.
  - Lixeira lógica (exclusão reversível) e exclusão definitiva.
- **Gerenciador de Leads e Propostas**: Visualização de todos os contatos recebidos com status (Novo, Em Atendimento, Concluído) e link direto para responder no WhatsApp.
- **Customização da Empresa**: Edição do nome, slogan, telefones, endereço, horários e **contadores de métricas** (veículos entregues, anos de mercado, clientes atendidos).

---

## 🛠️ Como Executar o Back-end C++ (Opcional)

Caso deseje compilar e rodar o servidor em C++17 Crow nativamente:

```bash
cd backend
mkdir build && cd build
cmake ..
make
./dealership_server
```
