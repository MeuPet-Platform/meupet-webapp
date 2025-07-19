# MeuPet Frontend - Microsserviço de Interface de Usuário

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Este repositório contém o **Microsserviço de Frontend** da aplicação MeuPet, atuando como a camada de apresentação e interação direta com o usuário. Desenvolvido com um stack tecnológico moderno e alinhado às melhores práticas do mercado, este serviço foi projetado para oferecer uma experiência fluida e responsiva em uma arquitetura de microsserviços.

---

## 🚀 Sobre o Projeto

O frontend MeuPet é a interface que permite aos tutores gerenciar seus pets e suas informações de saúde. Ele se integra perfeitamente com os **microsserviços de backend em Java (Quarkus)**, utilizando um **API Gateway (NGINX)** como ponto de entrada unificado para todas as comunicações.

### **Arquitetura e Tecnologias Principais:**

* **Framework de Desenvolvimento:**
    * **Next.js 15 (App Router):** Escolhido pela sua capacidade de roteamento avançado, otimização de renderização (Server-Side Rendering/Static Site Generation quando aplicável) e organização modular do código. Permite a criação de componentes tanto no servidor quanto no cliente.
    * **React 19:** Biblioteca fundamental para a construção de interfaces de usuário reativas, performáticas e baseadas em componentes.
* **Linguagem:** **TypeScript:** Garante maior segurança, legibilidade e manutenibilidade do código através da tipagem estática.
* **Estilização:**
    * **Tailwind CSS:** Framework CSS utility-first que acelera o desenvolvimento de UI com classes de utilidade, promovendo um design consistente e altamente personalizável.
    * **Shadcn UI:** Coleção de componentes UI acessíveis e reutilizáveis, construídos sobre Radix UI e estilizados com Tailwind CSS, que foram adaptados ao projeto para agilizar a criação da interface.
* **Gerenciamento de Pacotes:** **pnpm:** Utilizado para instalação de dependências de forma eficiente, otimizando o uso de espaço em disco e garantindo builds mais rápidos e reprodutíveis.
* **Comunicação com Backend (Microsserviços):**
    * **APIs RESTful:** Todas as interações são realizadas através de requisições HTTP para os microsserviços de backend (Usuários e Animais/Vacinas).
    * **NGINX API Gateway:** Configurado como o ponto de entrada único (`http://localhost:8000`), roteando todas as chamadas do frontend para os microsserviços apropriados, simplificando a comunicação e centralizando políticas como CORS e autenticação.
    * **Autenticação JWT (JSON Web Token):** Implementação segura de sessões de usuário, com armazenamento e envio de tokens (`Authorization: Bearer`) em todas as requisições protegidas.
    * **Tratamento de Dados Polimórficos:** Lógica frontend robusta para inferir e exibir corretamente diferentes tipos de animais (Cachorro, Gato, Ave) com base na presença de campos específicos nos dados retornados pela API, garantindo a apresentação precisa das características de cada pet.
* **Internacionalização de Datas:**
    * **`date-fns`:** Biblioteca utilizada para formatação e conversão precisa de datas.
    * Implementação de conversão bidirecional entre o formato brasileiro (`DD/MM/YYYY`) na UI e o formato ISO 8601 (`YYYY-MM-DD`) para comunicação com o backend, lidando com nuances de fuso horário.
* **Containerização:** **Docker:**
    * O frontend é empacotado em um container Docker, assegurando um ambiente de execução isolado e consistente em qualquer máquina.
    * **Docker Compose:** Utilizado para orquestrar o frontend em conjunto com o NGINX Gateway, microsserviços de backend e banco de dados, facilitando o desenvolvimento, testes e implantação de todo o ecossistema.
    * **Multi-stage builds:** Otimização do Dockerfile para criar imagens menores e mais eficientes para produção.

### **Funcionalidades Chave Implementadas:**

* **Autenticação e Perfil de Usuário:**
    * Processo de **Login** e **Cadastro** de novos usuários.
    * **Dashboard Personalizado:** Exibe a lista de animais pertencentes **exclusivamente ao usuário logado**, proporcionando uma visão gerenciável e individualizada.
    * **Página de Perfil:** Visualização e gerenciamento das informações pessoais do usuário.
* **Gerenciamento Abrangente de Pets:**
    * **Criação de Novos Animais:** Formulários dinâmicos para registro de cães, gatos e aves, incluindo campos específicos por tipo e a definição de "Porte".
    * **Visualização Detalhada:** Páginas dedicadas para exibir todas as características de cada pet.
    * **Edição Completa:** Formulários de edição que pré-preenchem corretamente os dados e permitem a atualização de informações gerais e específicas por tipo de animal.
    * **Exclusão de Registros:** Funcionalidade para remover pets do sistema.
* **Histórico de Vacinação e Saúde:**
    * **Adição de Vacinas:** Formulário intuitivo para registrar vacinas, com inputs de data no formato brasileiro e cálculo automático da próxima dose.
    * **Visualização do Histórico:** Tabela clara com todas as vacinas aplicadas, incluindo status de vacinação (Vacinado, Pendente, Atrasada).
    * **Gerenciamento Consolidado:** Futura área para gerenciamento centralizado de vacinas.

---

## 🛠️ Como Executar o Projeto

Para rodar o frontend em seu ambiente local, é necessário ter a infraestrutura (PostgreSQL, NGINX Gateway, Microsserviços de Backend) em execução.

#### Passo 1: Iniciar a Infraestrutura de Backend

Certifique-se de que seu `docker-compose.yml` da infraestrutura (contendo PostgreSQL, NGINX, e serviços de Users e Animals API) esteja em execução. Siga as instruções no repositório `meupet-infra` (ou o repositório que orquestra seus backends e NGINX).

Exemplo de comando (executado na raiz do seu repositório de infra/orquestração):

```bash
docker-compose up --build -d
````

#### Passo 2: Iniciar o Frontend

1.  **Clone este repositório:**

    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_FRONTEND.git]
    cd meupet-frontend-repo # Ou o nome da pasta do seu frontend
    ```

2.  **Construa a imagem Docker e inicie o container:**
    *Certifique-se de que seu `Dockerfile` está na raiz deste repositório.*

    ```bash
    docker-compose up --build -d
    ```

    *Se você está usando um `docker-compose.yml` mestre para todos os serviços, execute `docker-compose up --build -d` na raiz desse repositório mestre em vez de no repositório do frontend.*

3.  **Acesse a Aplicação:**
    Após os containers estarem `Up`, acesse `http://localhost:3000` em seu navegador.

-----

## ⚙️ Configuração (Variáveis de Ambiente)

O frontend utiliza variáveis de ambiente para configurar a URL do backend.

  - `NEXT_PUBLIC_API_URL`: A URL base para as chamadas da API. Em um ambiente orquestrado com Docker Compose, esta deve apontar para o NGINX Gateway.
      - Exemplo para desenvolvimento com Docker Compose: `http://nginx:8000` (se `nginx` for o nome do serviço no `docker-compose.yml`) ou `http://localhost:8000` (se o NGINX for acessado via `localhost` no host).

-----

## 🤝 Contribuição

Contribuições são bem-vindas\! Sinta-se à vontade para abrir issues ou pull requests.

-----
