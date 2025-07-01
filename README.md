## **MeuPet Frontend - Microsserviço de Interface de Usuário**

Este repositório contém o **Microsserviço de Frontend** da aplicação MeuPet, atuando como a camada de apresentação e interação direta com o usuário. Desenvolvido com um stack tecnológico moderno e alinhado às melhores práticas do mercado, este serviço foi projetado para oferecer uma experiência fluida e responsiva.

### **Tecnologias e Padrões Utilizados:**

* **Framework Principal:** **Next.js 15**
    * Utilização do **App Router** para roteamento robusto, renderização eficiente e organização modular do código.
    * Suporte a Server Components (onde aplicável) e Client Components (para interatividade).
* **Biblioteca de UI:** **React 19**
    * Construção de interfaces de usuário reativas e baseadas em componentes.
    * Gerenciamento de estado otimizado para uma UX (User Experience) aprimorada.
* **Estilização:**
    * **Tailwind CSS:** Framework CSS utility-first para um desenvolvimento de UI rápido e consistente.
    * **Shadcn UI:** Coleção de componentes UI pré-construídos e personalizáveis, estilizados com Tailwind CSS, para agilizar o desenvolvimento da interface.
* **Gerenciamento de Pacotes:** **pnpm**
    * Utilizado para instalação eficiente e performática de dependências, aproveitando o cache de conteúdo e o link simbólico para economizar espaço em disco.
* **Comunicação com Backend:**
    * Interage com um **microsserviço de backend em Java (Quarkus)** via **APIs RESTful**.
    * Implementação de chamadas assíncronas para endpoints de autenticação, gestão de animais e vacinas.
    * **Autenticação JWT (JSON Web Token):** Gerenciamento seguro de sessões de usuário, incluindo armazenamento do token e inclusão em cabeçalhos de requisição (`Authorization: Bearer`).
    * **Tratamento de Dados Polimórficos:** Lógica frontend para inferir e exibir corretamente diferentes tipos de animais (Cachorro, Gato, Ave) com base em campos específicos retornados pela API, garantindo a visualização precisa das características de cada pet.
* **Internacionalização de Datas:**
    * Formatação e conversão de datas entre o padrão brasileiro (`DD/MM/YYYY`) e o padrão ISO 8601 (`YYYY-MM-DD`) para comunicação com o backend, utilizando a biblioteca `date-fns` para precisão e robustez.
* **Containerização:** **Docker**
    * O aplicativo é containerizado para garantir um ambiente de execução consistente e isolado.
    * Orquestração via **Docker Compose**, permitindo que o frontend seja facilmente implantado e gerenciado em conjunto com o backend e outros serviços (como o banco de dados), utilizando a rede interna do Docker para comunicação entre serviços.
    * **Multi-stage builds** no Dockerfile para otimizar o tamanho final da imagem e a segurança.

### **Funcionalidades Implementadas:**

* **Autenticação e Gestão de Usuários:**
    * Login seguro com JWT.
    * Cadastro de novos usuários.
    * Visualização e gerenciamento do perfil do usuário logado.
* **Gerenciamento Abrangente de Pets:**
    * Criação de novos animais (cães, gatos, aves) com campos específicos para cada tipo e a definição de "Porte".
    * Visualização detalhada do perfil de cada pet, incluindo suas características únicas.
    * Edição de informações de pets existentes com formulários dinâmicos.
    * Exclusão de registros de pets.
* **Histórico de Vacinação e Saúde:**
    * Adição de registros de vacinas a pets específicos.
    * Visualização do histórico de vacinação de cada pet.
    * Cálculo de datas de revacinação e determinação do status de vacinação (Vacinado, Pendente, Atrasada).
* **Dashboard Personalizado:**
    * Exibe a lista de animais pertencentes **exclusivamente ao usuário logado**, proporcionando uma visão personalizada (dependente de endpoint específico no backend).


---
